// src/services/api.js
const BASE_URL = "http://192.168.100.19:8000/api";

export const getAccessToken  = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

export const saveTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
  console.log('All tokens cleared');
};

export const refreshAccessToken = async () => {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  try {
    const res = await fetch(`${BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    saveTokens(data.access, null);
    return data.access;
  } catch {
    return null;
  }
};

export const request = async (method, endpoint, body = null, retry = true) => {
  const token = getAccessToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, options);

    if (res.status === 401 && retry) {
      const newToken = await refreshAccessToken();
      if (newToken) return request(method, endpoint, body, false);
      clearTokens();
      window.location.reload();
      return { data: null, error: "Session expired", status: 401 };
    }

    let data = null;
    const ct = res.headers.get("content-type");
    if (ct && ct.includes("application/json")) data = await res.json();

    if (!res.ok) {
      const errorMsg =
        data?.detail ||
        data?.non_field_errors?.[0] ||
        Object.values(data || {})?.[0]?.[0] ||
        `Error ${res.status}`;
      return { data: null, error: errorMsg, status: res.status };
    }
    return { data, error: null, status: res.status };
  } catch {
    return { data: null, error: "Network error — is the backend running?", status: 0 };
  }
};

export const get   = (ep)       => request("GET",    ep);
export const post  = (ep, body) => request("POST",   ep, body);
export const patch = (ep, body) => request("PATCH",  ep, body);
export const del   = (ep)       => request("DELETE", ep);
export const unwrap = (result) => {
  if (result.data && result.data.results) {
    return { ...result, data: result.data.results };
  }
  return result;
};