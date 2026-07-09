"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/app/_actions/auth";
import { AuthCard } from "@/app/_components/auth/AuthCard";
import { SubmitButton } from "@/app/_components/auth/SubmitButton";

export function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [state, formAction] = useFormState(resetPasswordAction, {
    isSuccess: false,
    error: "",
  });

  useEffect(() => {
    if (state.isSuccess) {
      const t = setTimeout(() => router.push("/login"), 2000);
      return () => clearTimeout(t);
    }
  }, [state, router]);

  if (!token || !email) {
    return (
      <AuthCard title="لینک نامعتبر">
        <p className="text-sm text-[#898989] text-right">
          این لینک نامعتبر است. لطفاً دوباره از صفحه‌ی فراموشی رمز عبور اقدام
          کنید.
        </p>
        <Link
          href="/forgot-password"
          className="block mt-4 text-sm text-center text-[#A72F3B] font-medium"
        >
          رفتن به صفحه‌ی فراموشی رمز عبور
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="تنظیم رمز عبور جدید" subtitle={email}>
      {state.isSuccess ? (
        <p className="text-sm text-[#242424] bg-[#F7F7F7] px-3 py-3 rounded-lg text-right">
          رمز عبور با موفقیت تغییر کرد. در حال انتقال به صفحه‌ی ورود...
        </p>
      ) : (
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="email" value={email} />

          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-[#242424] text-right">
              رمز عبور جدید
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

          <div className="space-y-2">
            <label className="block text-[14px] font-medium text-[#242424] text-right">
              تکرار رمز عبور جدید
            </label>
            <input
              type="password"
              name="password_confirmation"
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

          <SubmitButton
            labelPending="در حال ثبت..."
            labelIdle="تغییر رمز عبور"
          />
        </form>
      )}
    </AuthCard>
  );
}
