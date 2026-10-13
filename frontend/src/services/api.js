
const API_URL = "http://127.0.0.1:8000/api";

/* =========================
   RESPONSE HELPER
========================= */

async function parseResponse(response) {
  const text = await response.text();
  let data = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.message ||
      data?.error ||
      (data && typeof data === "object"
        ? Object.values(data).flat().join(", ")
        : null) ||
      (text
        ? `Request failed (${response.status}): ${text.slice(0, 200)}`
        : `Request failed with status ${response.status}`);

    throw new Error(message);
  }

  if (response.status === 204 || !text) return null;
  return data !== null ? data : text;
}

/* =========================
   LOGOUT
========================= */

export function logoutUser() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

/* =========================
   TOKEN REFRESH
========================= */

let refreshPromise = null;

export async function refreshAccessToken() {
  // Reuse a refresh already in progress, avoiding concurrent refresh calls.
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refresh = localStorage.getItem("refresh");

    if (!refresh) {
      throw new Error("No refresh token found. Please log in again.");
    }

    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    const data = await parseResponse(response);

    if (!data?.access) {
      throw new Error("The refresh endpoint did not return an access token.");
    }

    localStorage.setItem("access", data.access);

    // Some configurations rotate the refresh token.
    if (data.refresh) {
      localStorage.setItem("refresh", data.refresh);
    }

    return data.access;
  })()
    .catch((error) => {
      logoutUser();
      throw error;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

/* =========================
   SHARED AUTHENTICATED REQUEST
========================= */

async function apiFetch(url, options = {}, retry = true) {
  const headers = new Headers(options.headers || {});
  const token = localStorage.getItem("access");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(url, {
    ...options,
    headers,
  });

  // Refresh only when the server returns 401, and retry once.
  if (response.status === 401 && retry) {
    try {
      const newToken = await refreshAccessToken();
      const retryHeaders = new Headers(options.headers || {});
      retryHeaders.set("Authorization", `Bearer ${newToken}`);

      response = await fetch(url, {
        ...options,
        headers: retryHeaders,
      });
    } catch (error) {
      // Do not hide the original refresh error.
      throw error;
    }
  }

  return response;
}

async function apiRequest(url, options = {}) {
  return parseResponse(await apiFetch(url, options));
}

/* =========================
   REGISTER & LOGIN
========================= */

export async function registerUser(userData) {
  return apiRequest(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
}

export async function loginUser(username, password) {
  const data = await apiRequest(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  if (!data?.access || !data?.refresh) {
    throw new Error("Login response did not contain both JWT tokens.");
  }

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  return data;
}

/* =========================
   CURRENT USER & PROFILE
========================= */

export async function getMe() {
  return apiRequest(`${API_URL}/auth/me/`);
}

export async function getProfile() {
  return apiRequest(`${API_URL}/auth/profile/`);
}

/* =========================
   PRODUCTS
========================= */

export async function getProducts() {
  return apiRequest(`${API_URL}/products/`);
}

export async function getProduct(id) {
  return apiRequest(`${API_URL}/products/${id}/`);
}

export async function createProduct(productData) {
  return apiRequest(`${API_URL}/products/`, {
    method: "POST",
    body: productData,
  });
}

export async function updateProduct(id, productData) {
  return apiRequest(`${API_URL}/products/${id}/`, {
    method: "PUT",
    body: productData,
  });
}

export async function deleteProduct(id) {
  await apiRequest(`${API_URL}/products/${id}/`, {
    method: "DELETE",
  });
  return true;
}

/* =========================
   INVENTORY
========================= */

export async function getInventory() {
  return apiRequest(`${API_URL}/inventory/`);
}

export async function addStock(id, quantity) {
  return apiRequest(`${API_URL}/inventory/${id}/add-stock/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export async function reduceStock(id, quantity) {
  return apiRequest(`${API_URL}/inventory/${id}/reduce-stock/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ quantity }),
  });
}

export async function getInventoryHistory(id) {
  return apiRequest(`${API_URL}/inventory/${id}/history/`);
}

/* =========================
   EXPIRY MONITORING
========================= */

export async function getExpiryProducts() {
  return apiRequest(`${API_URL}/expiry/`);
}

export async function getExpiringSoonProducts() {
  return apiRequest(`${API_URL}/expiry/expiring-soon/`);
}

export async function getExpiredProducts() {
  return apiRequest(`${API_URL}/expiry/expired/`);
}

export async function getSafeProducts() {
  return apiRequest(`${API_URL}/expiry/safe/`);
}

/* =========================
   ALERTS
========================= */

export async function getAlerts(filters = {}) {
  const params = new URLSearchParams();

  if (filters.read !== undefined && filters.read !== "") {
    params.append("read", filters.read);
  }

  if (filters.type) params.append("type", filters.type);

  const query = params.toString();
  return apiRequest(
    `${API_URL}/alerts/${query ? `?${query}` : ""}`
  );
}

export async function markAlertAsRead(id) {
  return apiRequest(`${API_URL}/alerts/${id}/read/`, {
    method: "PUT",
  });
}

export async function dismissAlert(id) {
  await apiRequest(`${API_URL}/alerts/${id}/`, {
    method: "DELETE",
  });
  return true;
}

/* =========================
   DYNAMIC PRICING
========================= */

export async function getPricing() {
  return apiRequest(`${API_URL}/pricing/`);
}

export async function getPricingSuggestions() {
  return apiRequest(`${API_URL}/pricing/suggestions/`);
}

export async function calculatePricing(productId) {
  return apiRequest(`${API_URL}/pricing/calculate/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ product: productId }),
  });
}

export async function createPricing(pricingData) {
  return apiRequest(`${API_URL}/pricing/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pricingData),
  });
}

export async function applyPricingDiscount(id, discountPercentage) {
  return apiRequest(`${API_URL}/pricing/${id}/apply/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      discount_percentage: discountPercentage,
    }),
  });
}

/* =========================
   SALES
========================= */

export async function getSales() {
  return apiRequest(`${API_URL}/sales/`);
}

export async function getSale(id) {
  return apiRequest(`${API_URL}/sales/${id}/`);
}

export async function createSale(saleData) {
  return apiRequest(`${API_URL}/sales/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(saleData),
  });
}

/* =========================
   DASHBOARD
========================= */

export async function getDashboard(period = "7") {
  return apiRequest(
    `${API_URL}/dashboard/?period=${encodeURIComponent(period)}`
  );
}

/* =========================
   REPORTS
========================= */

async function getReport(endpoint, filters = {}) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return apiRequest(
    `${API_URL}/reports/${endpoint}/${query ? `?${query}` : ""}`
  );
}

export function getSalesReport(filters = {}) {
  return getReport("sales", filters);
}

export function getInventoryReport(filters = {}) {
  return getReport("inventory", filters);
}

export function getExpiryReport(filters = {}) {
  return getReport("expiry", filters);
}

export function getLowStockReport(filters = {}) {
  return getReport("low-stock", filters);
}

export function getDiscountReport(filters = {}) {
  return getReport("discount", filters);
}

export async function downloadSalesReport(format, filters = {}) {
  const allowedFormats = ["csv", "excel", "pdf"];

  if (!allowedFormats.includes(format)) {
    throw new Error("Unsupported report format.");
  }

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const query = params.toString();
  const response = await apiFetch(
    `${API_URL}/reports/sales/export/${format}/${query ? `?${query}` : ""}`
  );

  if (!response.ok) {
    await parseResponse(response);
    throw new Error("Failed to download the sales report.");
  }

  const blob = await response.blob();
  const extension = format === "excel" ? "xlsx" : format;
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = `sales-report.${extension}`;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Delay revocation so the browser can begin the download.
  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

/* =========================
   ADMIN USER MANAGEMENT
========================= */

export async function getAdminUsers() {
  return apiRequest(`${API_URL}/auth/admin/users/`);
}

export async function updateAdminUser(userId, role) {
  return apiRequest(`${API_URL}/auth/admin/users/${userId}/`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
}