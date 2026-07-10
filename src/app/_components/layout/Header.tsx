"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { logoutAction } from "@/app/_actions/auth";
import { useAuthStore, getHomeRouteForRole } from "@/store/authStore";

const NAV_LINKS = [
  { href: "/services", label: "خدمات" },
  { href: "/how-it-works", label: "روند رزرو" },
  { href: "/about-us", label: "درباره ما" },
  { href: "/contact-us", label: "تماس با ما" },
];

export function Header() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const clearUser = useAuthStore((s) => s.clearUser);

  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setMenuOpen(false);
    await authAPI.logout().catch(() => {});
    await logoutAction();
    clearUser();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#EDEDED]">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* لوگو */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="w-8 h-8 rounded-lg bg-[#A72F3B] flex items-center justify-center text-white font-bold text-sm">
            ک
          </span>
          <span className="font-bold text-[#242424] text-base">
            کلینیک زیبایی
          </span>
        </Link>

        {/* ناوبری دسکتاپ */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#898989] hover:text-[#242424] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* بخش auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/booking/branch"
            className="hidden sm:inline-block px-4 py-2 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
          >
            رزرو نوبت
          </Link>

          {loading ? (
            <div className="w-9 h-9 rounded-full bg-[#F7F7F7] animate-pulse" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-9 h-9 rounded-full bg-[#FBEAEA] border border-[#EDEDED] flex items-center justify-center text-[#A72F3B] font-bold text-sm"
              >
                {user.name?.charAt(0) || "?"}
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-xl border border-[#EDEDED] shadow-lg z-20 overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#EDEDED] text-right">
                      <p className="text-sm font-medium text-[#242424] truncate">
                        {user.name}
                      </p>
                    </div>
                    <Link
                      href={getHomeRouteForRole(user.role)}
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-[#242424] hover:bg-[#F7F7F7] text-right transition-colors"
                    >
                      پنل کاربری
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2.5 text-sm text-[#C30000] hover:bg-[#FBEAEA] text-right transition-colors"
                    >
                      خروج
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl border border-[#EDEDED] text-[#242424] text-sm font-medium hover:border-[#A72F3B] transition"
            >
              ورود
            </Link>
          )}

          {/* دکمه منوی موبایل */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-[#242424]"
            aria-label="منو"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {mobileOpen ? (
                <path d="M18 6 6 18M6 6l12 12" />
              ) : (
                <path d="M3 6h18M3 12h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* منوی موبایل */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-[#EDEDED] px-4 py-3 space-y-1 bg-white">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-[#242424]"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/booking/branch"
            onClick={() => setMobileOpen(false)}
            className="block py-2 text-sm text-[#A72F3B] font-medium"
          >
            رزرو نوبت
          </Link>
        </nav>
      )}
    </header>
  );
}
