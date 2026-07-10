"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { logoutAction } from "@/app/_actions/auth";
import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const clearUser = useAuthStore((state) => state.clearUser);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  const handleLogout = async () => {
    await authAPI.logout().catch(() => {});
    await logoutAction();
    clearUser();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F7F7F7] px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-[#EDEDED] p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[#242424]">داشبورد</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-[#C30000] bg-[#FBEAEA] px-4 py-2 rounded-lg hover:bg-[#f5d9d9] transition"
          >
            خروج
          </button>
        </div>

        <div className="space-y-2 text-right">
          <p className="text-sm text-[#898989]">
            خوش آمدی،{" "}
            <span className="text-[#242424] font-medium">{user.name}</span>
          </p>
          <p className="text-sm text-[#898989]">
            ایمیل:{" "}
            <span className="text-[#242424] font-medium" dir="ltr">
              {user.email}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link
            href="/booking/branch"
            className="text-center py-3 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
          >
            رزرو نوبت جدید
          </Link>
          <Link
            href="/dashboard/appointments"
            className="text-center py-3 rounded-xl border border-[#EDEDED] text-[#242424] text-sm font-medium hover:border-[#A72F3B] transition"
          >
            نوبت‌های من
          </Link>
        </div>
      </div>
    </div>
  );
}
