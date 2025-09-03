import axios from "axios";

export const BASE_URL = "https://82b405a8b7de.ngrok-free.app";
const TOKEN_KEY = "csed_access_token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    const h = (config.headers ?? {}) as any;
    h["Authorization"] = `Bearer ${token}`;
    config.headers = h;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      clearToken();
    }
    return Promise.reject(err);
  },
);

export type LoginResponse = {
  access_token: string;
  id: string;
  roll: string;
};

export async function login(email: string, password: string) {
  const res = await api.post<LoginResponse>("/api/auth/login", { email, password });
  return res.data;
}
