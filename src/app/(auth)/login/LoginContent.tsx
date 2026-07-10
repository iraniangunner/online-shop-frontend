"use client";

import { useEffect, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/_actions/auth";
import { SubmitButton } from "@/app/_components/auth/SubmitButton";
import { OtpLoginForm } from "@/app/_components/auth/OtpLoginForm";
import { useAuthStore, getHomeRouteForRole } from "@/store/authStore";

type Tab = "email" | "otp";

const MailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-10 5L2 7" />
  </svg>
);

const MessageIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
  </svg>
);

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const explicitRedirect = searchParams.get("redirect");

  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const [tab, setTab] = useState<Tab>("email");

  const [loginState, loginFormAction] = useFormState(loginAction, {
    isSuccess: false,
    error: "",
  });

  useEffect(() => {
    if (!loading && user) {
      router.push(explicitRedirect || getHomeRouteForRole(user.role));
    }
  }, [user, loading, router, explicitRedirect]);

  useEffect(() => {
    if (loginState.isSuccess) {
      fetchUser().then(() => {
        const role = useAuthStore.getState().user?.role;
        router.push(
          explicitRedirect || getHomeRouteForRole(role || "customer"),
        );
      });
    }
  }, [loginState, fetchUser, router, explicitRedirect]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#EDEDED] p-6 space-y-6">
        <div className="space-y-1 text-right">
          <h1 className="text-xl font-bold text-[#242424]">ورود</h1>
          <p className="text-sm text-[#898989]">
            برای ادامه وارد حساب کاربری خود شوید
          </p>
        </div>

        {/* سوییچر تب با پس‌زمینه‌ی لغزان */}
        <div className="relative grid grid-cols-2 bg-[#F7F7F7] rounded-xl p-1">
          <div
            className="absolute inset-y-1 left-1 w-[calc(50%-6px)] bg-white rounded-lg shadow-sm border border-[#EDEDED] transition-transform duration-300 ease-out"
            style={{
              transform:
                tab === "otp"
                  ? "translateX(calc(100% + 8px))"
                  : "translateX(0)",
            }}
          />

          <button
            type="button"
            onClick={() => setTab("otp")}
            className={`relative z-10 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              tab === "otp" ? "text-[#A72F3B]" : "text-[#898989]"
            }`}
          >
            <MessageIcon />
            پیامک
          </button>
          <button
            type="button"
            onClick={() => setTab("email")}
            className={`relative z-10 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
              tab === "email" ? "text-[#A72F3B]" : "text-[#898989]"
            }`}
          >
            <MailIcon />
            ایمیل
          </button>
        </div>

        {/* محتوای تب با انیمیشن fade + slide؛ key باعث می‌شه با عوض شدن تب،
            کامپوننت OTP کامل remount بشه و مرحله‌اش ریست بشه */}
        <div key={tab} className="animate-tab-in">
          {tab === "email" && (
            <form action={loginFormAction} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[14px] font-medium text-[#242424] text-right">
                  ایمیل
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="email@example.com"
                  dir="ltr"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#EDEDED] bg-white text-left
                             placeholder:text-[#CBCBCB] text-[#242424]
                             focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10
                             transition text-sm"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[14px] font-medium text-[#242424] text-right">
                    رمز عبور
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-[#A72F3B] hover:underline"
                  >
                    فراموشی رمز عبور؟
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  dir="ltr"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#EDEDED] bg-white text-left
                             placeholder:text-[#CBCBCB] text-[#242424]
                             focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10
                             transition text-sm"
                />
              </div>

              {loginState.error && (
                <p className="text-sm text-[#C30000] text-right bg-[#FBEAEA] px-3 py-2 rounded-lg">
                  {loginState.error}
                </p>
              )}

              <SubmitButton labelPending="در حال ورود..." labelIdle="ورود" />

              <p className="text-sm text-center text-[#898989]">
                حساب نداری؟{" "}
                <Link href="/register" className="text-[#A72F3B] font-medium">
                  ثبت‌نام کن
                </Link>
              </p>
            </form>
          )}

          {tab === "otp" && (
            <OtpLoginForm explicitRedirect={explicitRedirect} />
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes tabIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-tab-in {
          animation: tabIn 0.22s ease-out;
        }
      `}</style>
    </div>
  );
}
