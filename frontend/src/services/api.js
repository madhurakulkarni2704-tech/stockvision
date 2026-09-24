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
export async function getProfile() {
  const token = localStorage.getItem("access");

  const response = await fetch(`${API_URL}/auth/profile/`, {
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