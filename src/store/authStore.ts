import { create } from "zustand";
import { authAPI } from "@/lib/api";

interface User {
  id: number;
  name: string;
  email: string;
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