"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export function AuthInitializer() {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    fetchUser();

    const handleLogout = () => clearUser();
    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, [fetchUser, clearUser]);

  return null;
}
