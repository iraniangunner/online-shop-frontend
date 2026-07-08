import axios, { InternalAxiosRequestConfig } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

declare module "axios" {
  export interface AxiosRequestConfig {
    requiresAuth?: boolean;
  }
  export interface InternalAxiosRequestConfig {
    requiresAuth?: boolean;
    _retry?: boolean;
  }
}

const api = axios.create({
  baseURL: API_URL, // http://onlineshop.test/api
});

// ----------------------
// Request Interceptor
// ----------------------
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  if (config.requiresAuth) {
    try {
      const res = await fetch("/api/token");
      const data = await res.json();

      if (data.token) {
        config.headers.set("Authorization", `Bearer ${data.token}`);
      }
    } catch (err) {
      console.error("Error fetching token:", err);
    }
  }
  return config;
});

// ----------------------
// Response Interceptor (Token Refresh)
// ----------------------
let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else if (token) prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/login") ||
      originalRequest.url?.includes("/register") ||
      originalRequest.url?.includes("/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers["Authorization"] = `Bearer ${token}`;
          return api(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const res = await fetch("/api/refresh-token", { method: "POST" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error("Refresh failed");
      }

      const newToken = data.access_token;

      processQueue(null, newToken);
      isRefreshing = false;

      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      isRefreshing = false;

      window.dispatchEvent(new Event("auth:logout"));

      return Promise.reject(err);
    }
  }
);

export default api;

export const authAPI = {
  me: () => api.get("/me", { requiresAuth: true }),
  logout: () => api.post("/logout", {}, { requiresAuth: true }),
};