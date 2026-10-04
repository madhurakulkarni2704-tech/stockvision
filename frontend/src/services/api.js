const API_URL = "http://127.0.0.1:8000/api";

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  // Save JWT tokens
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
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

/* =========================
   GET PROFILE
========================= */
export const getProfile = async () => {
  const token = localStorage.getItem("access");

  const response = await fetch(
    "http://127.0.0.1:8000/api/auth/profile/",
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch profile");
  }

  return response.json();
};

/* =========================
   REFRESH ACCESS TOKEN
========================= */
export async function refreshAccessToken() {
  const refresh = localStorage.getItem("refresh");

  if (!refresh) {
    throw new Error("No refresh token found");
  }

  const response = await fetch(`${API_URL}/auth/token/refresh/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      refresh,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    logoutUser();
    throw new Error(data.detail || "Session expired");
  }

  localStorage.setItem("access", data.access);

  return data.access;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function getProduct(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/products/${id}/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function updateProduct(id, productData) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/products/${id}/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: productData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function deleteProduct(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/products/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || JSON.stringify(data));
  }

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function addStock(id, quantity) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/inventory/${id}/add-stock/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      quantity,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function reduceStock(id, quantity) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/inventory/${id}/reduce-stock/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      quantity,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function getInventoryHistory(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/inventory/${id}/history/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function getExpiringSoonProducts() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/expiry/expiring-soon/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function getExpiredProducts() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/expiry/expired/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function getSafeProducts() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/expiry/safe/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
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
  const url = `${API_URL}/alerts/${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function markAlertAsRead(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/alerts/${id}/read/`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function dismissAlert(id) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/alerts/${id}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    throw new Error(data.detail || "Failed to dismiss alert");
  }

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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function getPricingSuggestions() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/pricing/suggestions/`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function calculatePricing(productId) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/pricing/calculate/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      product: productId,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
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

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}

export async function applyPricingDiscount(id, discountPercentage) {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/pricing/${id}/apply/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      discount_percentage: discountPercentage,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || JSON.stringify(data));
  }

  return data;
}
