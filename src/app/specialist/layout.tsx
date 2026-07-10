"use client";

import { useEffect, ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { authAPI } from "@/lib/api";
import { logoutAction } from "@/app/_actions/auth";
import { useAuthStore } from "@/store/authStore";

const NAV_ITEMS = [
  { href: "/specialist/appointments", label: "نوبت‌ها" },
  { href: "/specialist/working-hours", label: "ساعات کاری" },
  { href: "/specialist/time-off", label: "مرخصی" },
];

export default function SpecialistLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const clearUser = useAuthStore((s) => s.clearUser);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/login?redirect=" + pathname);
    } else if (user.role !== "specialist") {
      router.push("/login");
    }
  }, [user, loading, router, pathname]);

  async function handleLogout() {
    await authAPI.logout().catch(() => {});
    await logoutAction();
    clearUser();
    router.push("/login");
  }

  if (loading || !user || user.role !== "specialist") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7]">
      <header className="bg-white border-b border-[#EDEDED] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="text-xs text-[#C30000] bg-[#FBEAEA] px-3 py-1.5 rounded-lg hover:bg-[#f5d9d9] transition"
          >
            خروج
          </button>
          <div className="text-right">
            <p className="text-sm font-bold text-[#242424]">پنل متخصص</p>
            <p className="text-xs text-[#898989]">{user.name}</p>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-[#EDEDED] px-4">
        <div className="max-w-2xl mx-auto flex gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
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

      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
