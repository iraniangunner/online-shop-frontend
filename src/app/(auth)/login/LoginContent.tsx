"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/app/_actions/auth";
import { AuthCard } from "@/app/_components/auth/AuthCard";
import { SubmitButton } from "@/app/_components/auth/SubmitButton";
import { useAuthStore } from "@/store/authStore";

export function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/dashboard";

  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const [state, formAction] = useFormState(loginAction, {
    isSuccess: false,
    error: "",
  });

  useEffect(() => {
    if (!loading && user) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  useEffect(() => {
    if (state.isSuccess) {
      fetchUser().then(() => router.push(redirectUrl));
    }
  }, [state, fetchUser, router, redirectUrl]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  return (
    <AuthCard title="ورود" subtitle="برای ادامه وارد حساب کاربری خود شوید">
      <form action={formAction} className="space-y-4">
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
          <label className="block text-[14px] font-medium text-[#242424] text-right">
            رمز عبور
          </label>
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

        {state.error && (
          <p className="text-sm text-[#C30000] text-right bg-[#FBEAEA] px-3 py-2 rounded-lg">
            {state.error}
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
    </AuthCard>
  );
}
