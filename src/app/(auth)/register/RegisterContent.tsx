"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerAction } from "@/app/_actions/auth";
import { AuthCard } from "@/app/_components/auth/AuthCard";
import { SubmitButton } from "@/app/_components/auth/SubmitButton";

export function RegisterContent() {
  const router = useRouter();

  const [state, formAction] = useFormState(registerAction, {
    isSuccess: false,
    error: "",
  });

  useEffect(() => {
    if (state.isSuccess) {
      router.push("/login");
    }
  }, [state, router]);

  return (
    <AuthCard title="ثبت‌نام" subtitle="حساب کاربری جدید بسازید">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-[14px] font-medium text-[#242424] text-right">
            نام
          </label>
          <input
            type="text"
            name="name"
            placeholder="نام شما"
            required
            className="w-full px-4 py-3 rounded-xl border border-[#EDEDED] bg-white text-right
                       placeholder:text-[#CBCBCB] text-[#242424]
                       focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10
                       transition text-sm"
          />
        </div>

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

        <div className="space-y-2">
          <label className="block text-[14px] font-medium text-[#242424] text-right">
            تکرار رمز عبور
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

        <SubmitButton labelPending="در حال ثبت‌نام..." labelIdle="ثبت‌نام" />

        <p className="text-sm text-center text-[#898989]">
          حساب داری؟{" "}
          <Link href="/login" className="text-[#A72F3B] font-medium">
            وارد شو
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}
