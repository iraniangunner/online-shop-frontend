"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { paymentsAPI } from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";

type Result =
  | { state: "loading" }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const resetBooking = useBookingStore((s) => s.reset);

  const [result, setResult] = useState<Result>({ state: "loading" });

  useEffect(() => {
    const authority = searchParams.get("Authority");
    const status = searchParams.get("Status");

    if (!authority || !status) {
      setResult({
        state: "error",
        message: "اطلاعات بازگشتی از درگاه پرداخت نامعتبر است.",
      });
      return;
    }

    paymentsAPI
      .verify({ authority, status })
      .then((res) => {
        setResult({ state: "success", message: res.data.message });
        resetBooking(); // فلوی رزرو تموم شد، store رو پاک کن
      })
      .catch((err) => {
        setResult({
          state: "error",
          message: err?.response?.data?.message || "پرداخت تأیید نشد.",
        });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#EDEDED] p-6 space-y-5 text-center">
        {result.state === "loading" && (
          <>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A72F3B]" />
            </div>
            <p className="text-sm text-[#898989]">
              در حال بررسی نتیجه‌ی پرداخت...
            </p>
          </>
        )}

        {result.state === "success" && (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-[#EAF7EE] flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2E7D32"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-[#242424]">پرداخت موفق</h1>
            <p className="text-sm text-[#898989]">{result.message}</p>
            <Link
              href="/dashboard/appointments"
              className="block w-full py-3 rounded-xl bg-[#A72F3B] text-white font-medium text-sm hover:bg-[#8f2731] transition"
            >
              مشاهده‌ی نوبت‌های من
            </Link>
          </>
        )}

        {result.state === "error" && (
          <>
            <div className="w-14 h-14 mx-auto rounded-full bg-[#FBEAEA] flex items-center justify-center">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#C30000"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-[#242424]">پرداخت ناموفق</h1>
            <p className="text-sm text-[#898989]">{result.message}</p>
            <button
              onClick={() => router.push("/booking/branch")}
              className="w-full py-3 rounded-xl bg-[#A72F3B] text-white font-medium text-sm hover:bg-[#8f2731] transition"
            >
              تلاش مجدد برای رزرو
            </button>
          </>
        )}
      </div>
    </div>
  );
}
