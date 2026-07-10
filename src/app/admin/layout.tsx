"use client";

import { useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { logoutAction } from "@/app/_actions/auth";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { href: "/admin/appointments", label: "نوبت‌ها" },
  { href: "/admin/branches", label: "شعبه‌ها" },
  { href: "/admin/services", label: "خدمات" },
  { href: "/admin/categories", label: "دسته‌بندی‌ها" },
  { href: "/admin/specialists", label: "متخصص‌ها" },
  { href: "/admin/users", label: "کاربران" },
  { href: "/admin/reviews", label: "نظرات" },
  { href: "/admin/refunds", label: "ریفاندها" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login?redirect=" + pathname);
    } else if (user.role !== "admin") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  async function handleLogout() {
    await authAPI.logout().catch(() => {});
    await logoutAction();
    clearUser();
    router.push("/login");
  }

  if (loading || !user || user.role !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <nav className="bg-white border-b border-[#EDEDED] px-4 overflow-x-auto">
        <div className="max-w-6xl mx-auto flex gap-1 w-max min-w-full">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? "border-[#A72F3B] text-[#A72F3B]"
                    : "border-transparent text-[#898989] hover:text-[#242424]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
