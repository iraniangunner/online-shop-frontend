"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { availabilityAPI } from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
import { BookingShell } from "@/app/booking/BookingShell";

const TOTAL_DAYS = 28; // ۴ هفته
const DAYS_PER_PAGE = 7;

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nextDays(count: number): Date[] {
  const days: Date[] = [];
  const today = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

const ChevronRight = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronLeft = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export default function DateTimeSelectionPage() {
  const router = useRouter();
  const branchId = useBookingStore((s) => s.branchId);
  const specialistId = useBookingStore((s) => s.specialistId);
  const service = useBookingStore((s) => s.service);
  const setDateTime = useBookingStore((s) => s.setDateTime);

  const [days] = useState(() => nextDays(TOTAL_DAYS));
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(days[0]));
  const [unavailableDates, setUnavailableDates] = useState<Set<string>>(
    new Set(),
  );

  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const maxWeekOffset = Math.ceil(TOTAL_DAYS / DAYS_PER_PAGE) - 1;
  const pageDays = useMemo(
    () =>
      days.slice(
        weekOffset * DAYS_PER_PAGE,
        weekOffset * DAYS_PER_PAGE + DAYS_PER_PAGE,
      ),
    [days, weekOffset],
  );
  const monthLabel = pageDays[0]?.toLocaleDateString("fa-IR", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    if (!branchId) {
      router.replace("/booking/branch");
      return;
    }
    if (!service) {
      router.replace("/booking/service");
      return;
    }
    if (!specialistId) {
      router.replace("/booking/specialist");
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, specialistId, service?.id]);

  // یه‌بار برای کل بازه‌ی ۴ هفته، روزهای کاملاً بدون ساعت خالی رو می‌گیریم
  useEffect(() => {
    if (!branchId || !specialistId || !service) return;

    availabilityAPI
      .unavailableDays({
        specialist_id: specialistId,
        branch_id: branchId,
        service_ids: [service.id],
        start_date: toDateKey(days[0]),
        days: TOTAL_DAYS,
      })
      .then((res) => setUnavailableDates(new Set(res.data.unavailable_dates)))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, specialistId, service?.id]);

  // اگه روزِ انتخاب‌شده جزو روزهای غیرفعال بود، خودکار برو سراغ اولین روزِ آزاد
  useEffect(() => {
    if (unavailableDates.size === 0) return;
    if (!unavailableDates.has(selectedDate)) return;

    const firstAvailable = days.find(
      (d) => !unavailableDates.has(toDateKey(d)),
    );
    if (firstAvailable) {
      setSelectedDate(toDateKey(firstAvailable));
      setWeekOffset(Math.floor(days.indexOf(firstAvailable) / DAYS_PER_PAGE));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unavailableDates]);

  useEffect(() => {
    if (!branchId || !specialistId || !service) return;

    setLoading(true);
    setError("");

    availabilityAPI
      .slots({
        specialist_id: specialistId,
        branch_id: branchId,
        date: selectedDate,
        service_ids: [service.id],
      })
      .then((res) => setSlots(res.data.available_slots))
      .catch(() => setError("خطا در دریافت ساعت‌های خالی"))
      .finally(() => setLoading(false));
  }, [selectedDate, branchId, specialistId, service]);

  function handleSelectTime(time: string) {
    setDateTime(selectedDate, time);
    router.push("/booking/confirm");
  }

  function goToPrevWeek() {
    setWeekOffset((w) => Math.max(0, w - 1));
  }

  function goToNextWeek() {
    setWeekOffset((w) => Math.min(maxWeekOffset, w + 1));
  }

  if (!branchId || !service || !specialistId) return null;

  return (
    <BookingShell activeStep={3} title="تاریخ و ساعت را انتخاب کنید">
      {/* هدر ماه + ناوبری هفته */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToNextWeek}
          disabled={weekOffset >= maxWeekOffset}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#EDEDED] flex items-center justify-center text-[#898989]
                     hover:border-[#A72F3B] hover:text-[#A72F3B] transition disabled:opacity-30 disabled:pointer-events-none shrink-0"
          aria-label="هفته‌ی بعد"
        >
          <ChevronRight />
        </button>
        <span className="text-xs sm:text-sm font-semibold text-[#242424]">
          {monthLabel}
        </span>
        <button
          onClick={goToPrevWeek}
          disabled={weekOffset === 0}
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#EDEDED] flex items-center justify-center text-[#898989]
                     hover:border-[#A72F3B] hover:text-[#A72F3B] transition disabled:opacity-30 disabled:pointer-events-none shrink-0"
          aria-label="هفته‌ی قبل"
        >
          <ChevronLeft />
        </button>
      </div>

      {/* روزهای همین هفته */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {pageDays.map((day) => {
          const key = toDateKey(day);
          const isSelected = key === selectedDate;
          const isUnavailable = unavailableDates.has(key);

          return (
            <button
              key={key}
              onClick={() => !isUnavailable && setSelectedDate(key)}
              disabled={isUnavailable}
              title={isUnavailable ? "ساعت خالی ندارد" : undefined}
              className={`flex flex-col items-center gap-0.5 sm:gap-1 py-1.5 sm:py-2.5 px-0.5 rounded-lg sm:rounded-xl border transition-colors duration-200 min-w-0 ${
                isUnavailable
                  ? "bg-[#F7F7F7] border-transparent text-[#CBCBCB] cursor-not-allowed"
                  : isSelected
                    ? "bg-[#A72F3B] border-[#A72F3B] text-white"
                    : "bg-white border-[#EDEDED] text-[#242424] hover:border-[#A72F3B]"
              }`}
            >
              <span className="text-[8px] sm:text-[10px] opacity-80 truncate w-full text-center">
                {day.toLocaleDateString("fa-IR", { weekday: "short" })}
              </span>
              <span className="text-xs sm:text-sm font-bold">
                {day.toLocaleDateString("fa-IR", { day: "numeric" })}
              </span>
              {/* نشونگر نقطه‌ای: سبز = ساعت خالی داره، بدون نقطه = مشخص نیست/نداره */}
              <span
                className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${
                  isUnavailable
                    ? "bg-transparent"
                    : isSelected
                      ? "bg-white"
                      : "bg-[#2E7D32]"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* لیست ساعت‌های خالی */}
      <div className="pt-2">
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A72F3B]" />
          </div>
        )}

        {error && (
          <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
            {error}
          </p>
        )}

        {!loading && !error && slots.length === 0 && (
          <p className="text-sm text-[#898989] text-center py-8">
            برای این روز ساعت خالی‌ای موجود نیست. روز دیگری را انتخاب کنید.
          </p>
        )}

        {!loading && !error && slots.length > 0 && (
          <div dir="ltr" className="grid grid-cols-4 gap-2">
            {slots.map((time) => (
              <button
                key={time}
                onClick={() => handleSelectTime(time)}
                className="py-2.5 rounded-xl border border-[#EDEDED] text-sm font-medium text-[#242424]
                           hover:border-[#A72F3B] hover:bg-[#FBEAEA]/40 transition-colors duration-200"
              >
                {time}
              </button>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-[#898989] text-center pt-2">
        مدت‌زمان: {service.duration_minutes} دقیقه
      </p>

      <button
        onClick={() => router.push("/booking/specialist")}
        className="w-full text-sm text-center text-[#898989] hover:text-[#242424] transition"
      >
        تغییر متخصص
      </button>
    </BookingShell>
  );
}
