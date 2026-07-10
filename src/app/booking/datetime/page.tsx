"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { availabilityAPI } from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
import { BookingShell } from "@/app/booking/BookingShell";

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

export default function DateTimeSelectionPage() {
  const router = useRouter();
  const branchId = useBookingStore((s) => s.branchId);
  const specialistId = useBookingStore((s) => s.specialistId);
  const service = useBookingStore((s) => s.service);
  const setDateTime = useBookingStore((s) => s.setDateTime);

  const days = useMemo(() => nextDays(14), []);
  const [selectedDate, setSelectedDate] = useState<string>(toDateKey(days[0]));

  const [slots, setSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (!branchId || !service || !specialistId) return null;

  return (
    <BookingShell activeStep={3} title="تاریخ و ساعت را انتخاب کنید">
      {/* انتخاب روز - اسکرول افقی */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {days.map((day) => {
          const key = toDateKey(day);
          const isSelected = key === selectedDate;
          return (
            <button
              key={key}
              onClick={() => setSelectedDate(key)}
              className={`shrink-0 flex flex-col items-center gap-0.5 px-3 py-2.5 rounded-xl border transition-colors duration-200 ${
                isSelected
                  ? "bg-[#A72F3B] border-[#A72F3B] text-white"
                  : "bg-white border-[#EDEDED] text-[#242424] hover:border-[#A72F3B]"
              }`}
            >
              <span className="text-[10px] opacity-80">
                {day.toLocaleDateString("fa-IR", { weekday: "short" })}
              </span>
              <span className="text-sm font-semibold">
                {day.toLocaleDateString("fa-IR", { day: "numeric", month: "short" })}
              </span>
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