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

// ----------------------
// Auth
// ----------------------
export const authAPI = {
  me: () => api.get("/me", { requiresAuth: true }),
  logout: () => api.post("/logout", {}, { requiresAuth: true }),
};

// ----------------------
// عمومی (بدون نیاز به لاگین)
// ----------------------
export const branchesAPI = {
  list: () => api.get("/branches"),
  show: (id: number) => api.get(`/branches/${id}`),
};

export const servicesAPI = {
  list: (params?: { branch_id?: number; category_id?: number }) =>
    api.get("/services", { params }),
  show: (id: number) => api.get(`/services/${id}`),
};

export const specialistsAPI = {
  // متخصص‌هایی که همه‌ی خدمات انتخابی رو در یک شعبه پوشش می‌دن
  forServices: (branchId: number, serviceIds: number[]) =>
    api.get("/specialists", {
      params: {
        branch_id: branchId,
        "service_ids[]": serviceIds,
      },
    }),
};

// ----------------------
// رزرو نوبت (نیاز به لاگین مشتری)
// ----------------------
export const availabilityAPI = {
  slots: (params: {
    specialist_id: number;
    branch_id: number;
    date: string;
    service_ids: number[];
  }) =>
    api.get("/available-slots", {
      params: {
        specialist_id: params.specialist_id,
        branch_id: params.branch_id,
        date: params.date,
        "service_ids[]": params.service_ids,
      },
      requiresAuth: true,
    }),

  unavailableDays: (params: {
    specialist_id: number;
    branch_id: number;
    service_ids: number[];
    start_date: string;
    days?: number;
  }) =>
    api.get("/unavailable-days", {
      params: {
        specialist_id: params.specialist_id,
        branch_id: params.branch_id,
        start_date: params.start_date,
        days: params.days ?? 14,
        "service_ids[]": params.service_ids,
      },
      requiresAuth: true,
    }),
};

export const appointmentsAPI = {
  list: (params?: {
    page?: number;
    status?: string;
    date_from?: string;
    date_to?: string;
  }) => api.get("/appointments", { params, requiresAuth: true }),
  show: (id: number) => api.get(`/appointments/${id}`, { requiresAuth: true }),
  create: (payload: {
    branch_id: number;
    specialist_id: number;
    service_ids: number[];
    date: string;
    time: string;
  }) => api.post("/appointments", payload, { requiresAuth: true }),
  cancel: (id: number) =>
    api.post(`/appointments/${id}/cancel`, {}, { requiresAuth: true }),
  review: (id: number, payload: { rating: number; comment?: string }) =>
    api.post(`/appointments/${id}/review`, payload, { requiresAuth: true }),
};

export const paymentsAPI = {
  verify: (payload: { authority: string; status: string }) =>
    api.post("/payments/verify", payload),
};

// ----------------------
// پنل متخصص
// ----------------------
export const specialistAPI = {
  appointments: (params?: { date?: string; status?: string }) =>
    api.get("/specialist/appointments", { params, requiresAuth: true }),
  updateAppointmentStatus: (id: number, status: string) =>
    api.patch(
      `/specialist/appointments/${id}/status`,
      { status },
      { requiresAuth: true }
    ),

  workingHours: () =>
    api.get("/specialist/working-hours", { requiresAuth: true }),
  replaceWorkingHours: (
    branchId: number,
    hours: { day_of_week: number; start_time: string; end_time: string }[]
  ) =>
    api.put(
      "/specialist/working-hours",
      { branch_id: branchId, hours },
      { requiresAuth: true }
    ),

  timeOff: () => api.get("/specialist/time-off", { requiresAuth: true }),
  createTimeOff: (payload: {
    starts_at: string;
    ends_at: string;
    reason?: string;
    branch_id?: number;
  }) => api.post("/specialist/time-off", payload, { requiresAuth: true }),
  deleteTimeOff: (id: number) =>
    api.delete(`/specialist/time-off/${id}`, { requiresAuth: true }),
};

// ----------------------
// پنل ادمین
// ----------------------
export const adminAPI = {
  dashboard: () => api.get("/admin/dashboard", { requiresAuth: true }),

  // شعبه‌ها
  branches: {
    list: (page = 1) =>
      api.get("/admin/branches", { params: { page }, requiresAuth: true }),
    show: (id: number) =>
      api.get(`/admin/branches/${id}`, { requiresAuth: true }),
    create: (payload: any) =>
      api.post("/admin/branches", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/branches/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/branches/${id}`, { requiresAuth: true }),
  },

  // دسته‌بندی خدمات
  serviceCategories: {
    list: () => api.get("/admin/service-categories", { requiresAuth: true }),
    create: (payload: any) =>
      api.post("/admin/service-categories", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/service-categories/${id}`, payload, {
        requiresAuth: true,
      }),
    delete: (id: number) =>
      api.delete(`/admin/service-categories/${id}`, { requiresAuth: true }),
  },

  // خدمات
  services: {
    list: (page = 1) =>
      api.get("/admin/services", { params: { page }, requiresAuth: true }),
    show: (id: number) =>
      api.get(`/admin/services/${id}`, { requiresAuth: true }),
    create: (payload: any) =>
      api.post("/admin/services", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/services/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/services/${id}`, { requiresAuth: true }),
  },

  // متخصص‌ها
  specialists: {
    list: (page = 1) =>
      api.get("/admin/specialists", { params: { page }, requiresAuth: true }),
    show: (id: number) =>
      api.get(`/admin/specialists/${id}`, { requiresAuth: true }),
    create: (payload: any) =>
      api.post("/admin/specialists", payload, { requiresAuth: true }),
    update: (id: number, payload: any) =>
      api.put(`/admin/specialists/${id}`, payload, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/specialists/${id}`, { requiresAuth: true }),
  },

  // نوبت‌ها
  appointments: {
    list: (params?: {
      status?: string;
      specialist_id?: number;
      branch_id?: number;
      date_from?: string;
      date_to?: string;
      page?: number;
    }) => api.get("/admin/appointments", { params, requiresAuth: true }),
    show: (id: number) =>
      api.get(`/admin/appointments/${id}`, { requiresAuth: true }),
    updateStatus: (
      id: number,
      payload: { status: string; admin_note?: string; cancel_reason?: string }
    ) =>
      api.patch(`/admin/appointments/${id}/status`, payload, {
        requiresAuth: true,
      }),
  },

  // کاربران/مشتریان
  users: {
    list: (params?: { search?: string; page?: number }) =>
      api.get("/admin/users", { params, requiresAuth: true }),
    show: (id: number) => api.get(`/admin/users/${id}`, { requiresAuth: true }),
    toggleActive: (id: number) =>
      api.patch(`/admin/users/${id}/toggle-active`, {}, { requiresAuth: true }),
  },

  // نظرات
  reviews: {
    list: (params?: { approved?: boolean }) =>
      api.get("/admin/reviews", { params, requiresAuth: true }),
    approve: (id: number) =>
      api.patch(`/admin/reviews/${id}/approve`, {}, { requiresAuth: true }),
    delete: (id: number) =>
      api.delete(`/admin/reviews/${id}`, { requiresAuth: true }),
  },

  // ریفاندهای در انتظار
  payments: {
    pendingRefunds: (page = 1) =>
      api.get("/admin/payments/pending-refunds", {
        params: { page },
        requiresAuth: true,
      }),
    markRefunded: (id: number) =>
      api.patch(
        `/admin/payments/${id}/mark-refunded`,
        {},
        { requiresAuth: true }
      ),
  },
};
