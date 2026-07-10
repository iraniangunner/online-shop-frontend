import { create } from "zustand";
import { authAPI } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: "customer" | "specialist" | "admin";
  specialist_id: number | null;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const res = await authAPI.me();
      set({ user: res.data, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  setUser: (user) => set({ user, loading: false }),

  clearUser: () => set({ user: null, loading: false }),
}));

/**
 * بر اساس نقش کاربر، مسیر پیش‌فرض بعد از لاگین رو مشخص می‌کنه.
 */
export function getHomeRouteForRole(role: User["role"]): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "specialist":
      return "/specialist/appointments";
    default:
      return "/dashboard";
  }
}