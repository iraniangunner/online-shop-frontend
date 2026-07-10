"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { appointmentsAPI } from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
import { BookingShell } from "@/app/booking/BookingShell";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

// date به فرمت "YYYY-MM-DD" میلادی ذخیره شده (چون بک‌اند همینو می‌خواد)،
// اینجا فقط برای نمایش به کاربر به تقویم جلالی تبدیلش می‌کنیم.
// عمداً هر بخش (روز هفته، روز+ماه، سال) رو جدا می‌گیریم و دستی به ترتیب
// درست کنار هم می‌ذاریم، چون ترتیب پیش‌فرض toLocaleDateString با چند
// آپشن هم‌زمان همیشه قابل‌اعتماد نیست.
function formatJalaliDate(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  const weekday = date.toLocaleDateString("fa-IR", { weekday: "long" });
  const dayMonth = date.toLocaleDateString("fa-IR", { day: "numeric", month: "long" });
  const yearOnly = date.toLocaleDateString("fa-IR", { year: "numeric" });

  return `${weekday}، ${dayMonth} ${yearOnly}`;
}

export default function ConfirmBookingPage() {
  const router = useRouter();
  const branchId = useBookingStore((s) => s.branchId);
  const branchName = useBookingStore((s) => s.branchName);
  const service = useBookingStore((s) => s.service);
  const specialistId = useBookingStore((s) => s.specialistId);
  const specialistName = useBookingStore((s) => s.specialistName);
  const date = useBookingStore((s) => s.date);
  const time = useBookingStore((s) => s.time);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!branchId) {
      router.replace("/booking/branch");
    } else if (!service) {
      router.replace("/booking/service");
    } else if (!specialistId) {
      router.replace("/booking/specialist");
    } else if (!date || !time) {
      router.replace("/booking/datetime");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleConfirm() {
    if (!branchId || !specialistId || !service || !date || !time) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await appointmentsAPI.create({
        branch_id: branchId,
        specialist_id: specialistId,
        service_ids: [service.id],
        date,
        time,
      });

      const paymentUrl = res.data.payment_url;

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setError(
          "نوبت ثبت شد ولی لینک پرداخت دریافت نشد. با پشتیبانی تماس بگیرید."
        );
        setSubmitting(false);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      const message = err?.response?.data?.message;

      if (status === 409) {
        setError(
          "این ساعت لحظاتی پیش توسط شخص دیگری رزرو شد. لطفاً ساعت دیگری انتخاب کنید."
        );
      } else {
        setError(message || "خطا در ثبت نوبت. لطفاً دوباره تلاش کنید.");
      }
      setSubmitting(false);
    }
  }

  if (!branchId || !service || !specialistId || !date || !time) {
    return null;
  }

  return (
    <BookingShell activeStep={4} title="خلاصه‌ی نوبت شما">
      <div className="space-y-3">
        <div className="flex items-center justify-between py-2 border-b border-[#EDEDED]">
          <span className="text-xs text-[#898989]">شعبه</span>
          <span className="text-sm text-[#242424] font-medium">{branchName}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#EDEDED]">
          <span className="text-xs text-[#898989]">خدمت</span>
          <span className="text-sm text-[#242424] font-medium">{service.name}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#EDEDED]">
          <span className="text-xs text-[#898989]">متخصص</span>
          <span className="text-sm text-[#242424] font-medium">{specialistName}</span>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#EDEDED]">
          <span className="text-xs text-[#898989]">تاریخ و ساعت</span>
          <div className="text-left">
            <p className="text-sm text-[#242424] font-medium">
              {formatJalaliDate(date)}
            </p>
            <p dir="ltr" className="text-xs text-[#898989]">
              {time}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-[#EDEDED]">
          <span className="text-xs text-[#898989]">مدت‌زمان</span>
          <span className="text-sm text-[#242424] font-medium">
            {service.duration_minutes} دقیقه
          </span>
        </div>

        <div className="flex items-center justify-between py-3">
          <span className="text-sm text-[#242424] font-medium">مبلغ قابل پرداخت</span>
          <span className="text-lg text-[#A72F3B] font-bold">
            {formatPrice(service.price)}
          </span>
        </div>
      </div>

      {error && (
        <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
          {error}
        </p>
      )}

      <button
        onClick={handleConfirm}
        disabled={submitting}
        className="w-full py-3 rounded-xl bg-[#A72F3B] text-white font-medium text-sm
                   transition hover:bg-[#8f2731] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting
          ? "در حال انتقال به درگاه پرداخت..."
          : "پرداخت و ثبت نهایی نوبت"}
      </button>

      <button
        onClick={() => router.push("/booking/datetime")}
        disabled={submitting}
        className="w-full text-sm text-center text-[#898989] hover:text-[#242424] transition disabled:opacity-50"
      >
        تغییر تاریخ و ساعت
      </button>
    </BookingShell>
  );
}