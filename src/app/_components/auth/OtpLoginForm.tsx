"use client";

import { useEffect, useRef, useState } from "react";
import { useFormState } from "react-dom";
import { useRouter } from "next/navigation";
import { sendOtpAction, verifyOtpAction } from "@/app/_actions/auth";
import { SubmitButton } from "@/app/_components/auth/SubmitButton";
import { OtpInput } from "@/app/_components/auth/OtpInput";
import { ResendTimer } from "@/app/_components/auth/ResendTimer";
import { useAuthStore } from "@/store/authStore";

export function OtpLoginForm({ redirectUrl }: { redirectUrl: string }) {
  const router = useRouter();
  const fetchUser = useAuthStore((state) => state.fetchUser);

  const [step, setStep] = useState<"mobile" | "code">("mobile");
  const [canResend, setCanResend] = useState(false);

  const [sendState, sendFormAction] = useFormState(sendOtpAction, {
    isSuccess: false,
    error: "",
    mobile: "",
  });
  const [verifyState, verifyFormAction] = useFormState(verifyOtpAction, {
    isSuccess: false,
    error: "",
    mobile: "",
  });

  // چون useFormState یه object جدید برمی‌گردونه ولی اگه کاربر دستی step رو
  // به "mobile" برگردونه، sendState.isSuccess هنوز true از قبل می‌مونه -
  // با این ref فقط یه‌بار به هر ارسال جدید واکنش نشون می‌دیم، نه هر بار
  // که step عوض بشه.
  const lastHandledSendState = useRef(sendState);

  useEffect(() => {
    if (sendState !== lastHandledSendState.current) {
      lastHandledSendState.current = sendState;
      if (sendState.isSuccess) {
        setStep("code");
        setCanResend(false);
      }
    }
  }, [sendState]);

  useEffect(() => {
    if (verifyState.isSuccess) fetchUser().then(() => router.push(redirectUrl));
  }, [verifyState, fetchUser, router, redirectUrl]);

  function backToMobile() {
    setStep("mobile");
  }

  if (step === "mobile") {
    return (
      <form action={sendFormAction} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-[14px] font-medium text-[#242424] text-right">
            شماره موبایل
          </label>
          <input
            type="tel"
            name="mobile"
            placeholder="09123456789"
            dir="ltr"
            required
            pattern="09[0-9]{9}"
            defaultValue={sendState.mobile}
            className="w-full px-4 py-3 rounded-xl border border-[#EDEDED] bg-white text-left
                       placeholder:text-[#CBCBCB] text-[#242424]
                       focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10
                       transition text-sm"
          />
        </div>

        {sendState.error && (
          <p className="text-sm text-[#C30000] text-right bg-[#FBEAEA] px-3 py-2 rounded-lg">
            {sendState.error}
          </p>
        )}

        <SubmitButton labelPending="در حال ارسال..." labelIdle="دریافت کد" />
      </form>
    );
  }

  return (
    <div className="space-y-4">
      <form action={verifyFormAction} className="space-y-4">
        <input type="hidden" name="mobile" value={sendState.mobile} />

        <p className="text-sm text-[#898989] text-right">
          کد ارسال‌شده به{" "}
          <span dir="ltr" className="text-[#242424] font-medium">
            {sendState.mobile}
          </span>{" "}
          را وارد کنید
        </p>

        <OtpInput name="code" length={6} />

        {verifyState.error && (
          <p className="text-sm text-[#C30000] text-right bg-[#FBEAEA] px-3 py-2 rounded-lg">
            {verifyState.error}
          </p>
        )}

        <SubmitButton labelPending="در حال بررسی..." labelIdle="تأیید و ورود" />
      </form>

      <div className="space-y-2">
        {!canResend ? (
          <ResendTimer
            seconds={120}
            resetKey={sendState}
            onExpire={() => setCanResend(true)}
          />
        ) : (
          <form action={sendFormAction} className="flex justify-center">
            <input type="hidden" name="mobile" value={sendState.mobile} />
            <button
              type="submit"
              className="text-sm text-[#A72F3B] font-medium hover:underline"
            >
              ارسال مجدد کد
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={backToMobile}
          className="w-full text-sm text-center text-[#898989] hover:text-[#242424] transition"
        >
          تغییر شماره موبایل
        </button>
      </div>
    </div>
  );
}
