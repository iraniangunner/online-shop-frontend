"use client";

import { useFormState } from "react-dom";
import Link from "next/link";
import { forgotPasswordAction } from "@/app/_actions/auth";
import { AuthCard } from "@/app/_components/auth/AuthCard";
import { SubmitButton } from "@/app/_components/auth/SubmitButton";

export function ForgotPasswordContent() {
  const [state, formAction] = useFormState(forgotPasswordAction, {
    isSuccess: false,
    error: "",
  });

  return (
    <AuthCard
      title="فراموشی رمز عبور"
      subtitle="ایمیل حساب کاربری خود را وارد کنید"
    >
      {state.isSuccess ? (
        <div className="space-y-4 text-right">
          <p className="text-sm text-[#242424] bg-[#F7F7F7] px-3 py-3 rounded-lg">
            اگر این ایمیل در سیستم ثبت شده باشد، لینک بازیابی رمز عبور برایش
            ارسال شد. صندوق ایمیل خود را بررسی کنید.
          </p>
          <Link
            href="/login"
            className="block text-sm text-center text-[#A72F3B] font-medium"
          >
            بازگشت به ورود
          </Link>
        </div>
      ) : (
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

          {state.error && (
            <p className="text-sm text-[#C30000] text-right bg-[#FBEAEA] px-3 py-2 rounded-lg">
              {state.error}
            </p>
          )}

          <SubmitButton
            labelPending="در حال ارسال..."
            labelIdle="ارسال لینک بازیابی"
          />

          <p className="text-sm text-center text-[#898989]">
            <Link href="/login" className="text-[#A72F3B] font-medium">
              بازگشت به ورود
            </Link>
          </p>
        </form>
      )}
    </AuthCard>
  );
}
