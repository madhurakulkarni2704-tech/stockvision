const API_URL = "http://127.0.0.1:8000/api";

/* =========================
   RESPONSE HELPER
========================= */

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const text = await response.text();

  let data = null;

  if (text) {
    if (contentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    } else {
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
    }
  }

  if (!response.ok) {
    if (data) {
      const message =
        data.detail ||
        data.message ||
        data.error ||
        Object.values(data)
          .flat()
          .join(", ") ||
        `Request failed with status ${response.status}`;

      throw new Error(message);
    }

    if (text) {
      throw new Error(
        `Request failed with status ${response.status}. Server returned: ${text.slice(
          0,
          300
        )}`
      );
    }

    throw new Error(
      `Request failed with status ${response.status}`
    );
  }

  if (response.status === 204 || !text) {
    return null;
  }

  return data !== null ? data : text;
}

/* =========================
   REGISTER
========================= */

export async function registerUser(userData) {
  const response = await fetch(`${API_URL}/auth/register/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  return parseResponse(response);
}

/* =========================
   LOGIN
========================= */

export async function loginUser(username, password) {
  const response = await fetch(`${API_URL}/auth/login/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  });

  const data = await parseResponse(response);

  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);

  return data;
}

/* =========================
   LOGOUT
========================= */

export function logoutUser() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
}

/* =========================
   GET CURRENT USER
========================= */

export async function getMe() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/auth/me/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

/* =========================
   GET PROFILE
========================= */

export const getProfile = async () => {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/auth/profile/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
};

/* =========================
   REFRESH ACCESS TOKEN
========================= */

export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    throw new Error("No refresh token found");
  }

  const response = await fetch(
    `${API_URL}/auth/token/refresh/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh,
      }),
    }
  );

  try {
    const data = await parseResponse(response);

    localStorage.setItem("access", data.access);

    return data.access;
  } catch (error) {
    logoutUser();
    throw error;
  }
}

/* =========================
   PRODUCT MANAGEMENT
========================= */

export async function getProducts() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/products/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function getProduct(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/products/${id}/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function createProduct(productData) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/products/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: productData,
  });

  return parseResponse(response);
}

export async function updateProduct(id, productData) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/products/${id}/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: productData,
    }
  );

  return parseResponse(response);
}

export async function deleteProduct(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/products/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  await parseResponse(response);

  return true;
}

/* =========================
   INVENTORY MANAGEMENT
========================= */

export async function getInventory() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/inventory/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function addStock(id, quantity) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/inventory/${id}/add-stock/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity,
      }),
    }
  );

  return parseResponse(response);
}

export async function reduceStock(id, quantity) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/inventory/${id}/reduce-stock/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        quantity,
      }),
    }
  );

  return parseResponse(response);
}

export async function getInventoryHistory(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/inventory/${id}/history/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}

/* =========================
   EXPIRY MONITORING
========================= */

export async function getExpiryProducts() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/expiry/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function getExpiringSoonProducts() {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/expiry/expiring-soon/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}

export async function getExpiredProducts() {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/expiry/expired/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}

export async function getSafeProducts() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/expiry/safe/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

/* =========================
   ALERTS & NOTIFICATIONS
========================= */

export async function getAlerts(filters = {}) {
  const token = localStorage.getItem("access");

  const params = new URLSearchParams();

  if (filters.read) {
    params.append("read", filters.read);
  }

  if (filters.type) {
    params.append("type", filters.type);
  }

  const queryString = params.toString();

  const url = `${API_URL}/alerts/${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function markAlertAsRead(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/alerts/${id}/read/`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}

export async function dismissAlert(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/alerts/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  await parseResponse(response);

  return true;
}

/* =========================
   DYNAMIC PRICING
========================= */

export async function getPricing() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/pricing/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function getPricingSuggestions() {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/pricing/suggestions/`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}

export async function calculatePricing(productId) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/pricing/calculate/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        product: productId,
      }),
    }
  );

  return parseResponse(response);
}

export async function createPricing(pricingData) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/pricing/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pricingData),
  });

  return parseResponse(response);
}

export async function applyPricingDiscount(
  id,
  discountPercentage
) {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/pricing/${id}/apply/`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        discount_percentage: discountPercentage,
      }),
    }
  );

  return parseResponse(response);
}

/* =========================
   SALES MANAGEMENT
========================= */

export async function getSales() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/sales/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function getSale(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/sales/${id}/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
}

export async function createSale(saleData) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/sales/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(saleData),
  });

  return parseResponse(response);
}

/* =========================
   DASHBOARD & ANALYTICS
========================= */

export async function getDashboard(period = "7") {
  const token = localStorage.getItem("access");

  const response = await fetch(
    `${API_URL}/dashboard/?period=${encodeURIComponent(
      period
    )}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return parseResponse(response);
}


/* =========================
   MODULE 9 - REPORTS
========================= */

async function getReport(endpoint, filters = {}) {
  const token = localStorage.getItem("access");
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const url = `${API_URL}/reports/${endpoint}/${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return parseResponse(response);
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

  const token = localStorage.getItem("access");
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const url = `${API_URL}/reports/sales/export/${format}/${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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
  URL.revokeObjectURL(downloadUrl);
}

