"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { specialistsAPI } from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
import { BookingShell } from "@/app/booking/BookingShell";
import type { Specialist } from "@/types";

export default function SpecialistSelectionPage() {
  const router = useRouter();
  const branchId = useBookingStore((s) => s.branchId);
  const service = useBookingStore((s) => s.service);
  const setSpecialist = useBookingStore((s) => s.setSpecialist);

  const [specialists, setSpecialists] = useState<Specialist[]>([]);
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

    specialistsAPI
      .forServices(branchId, [service.id])
      .then((res) => setSpecialists(res.data))
      .catch(() => setError("خطا در دریافت لیست متخصص‌ها"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchId, service?.id]);

  function handleSelect(specialist: Specialist) {
    setSpecialist(specialist.id, specialist.full_name);
    router.push("/booking/datetime");
  }

  if (!branchId || !service) return null;

  return (
    <BookingShell activeStep={2} title="متخصص مورد نظرتان را انتخاب کنید">
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

      {!loading && !error && specialists.length === 0 && (
        <div className="text-center py-8 space-y-3">
          <p className="text-sm text-[#898989]">
            متأسفانه متخصصی برای این خدمت در این شعبه ثبت نشده است.
          </p>
          <button
            onClick={() => router.push("/booking/service")}
            className="text-sm text-[#A72F3B] font-medium hover:underline"
          >
            بازگشت و تغییر خدمت
          </button>
        </div>
      )}

      <div className="space-y-3">
        {specialists.map((specialist) => (
          <button
            key={specialist.id}
            onClick={() => handleSelect(specialist)}
            className="w-full text-right p-4 rounded-xl border border-[#EDEDED] hover:border-[#A72F3B]
                       hover:bg-[#FBEAEA]/40 transition-colors duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F7F7F7] border border-[#EDEDED] flex items-center justify-center shrink-0 overflow-hidden">
                {specialist.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={specialist.avatar}
                    alt={specialist.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#A72F3B] font-bold text-lg">
                    {specialist.full_name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="flex-1 text-right">
                <p className="font-medium text-[#242424]">
                  {specialist.full_name}
                </p>
                {specialist.bio && (
                  <p className="text-xs text-[#898989] mt-0.5 line-clamp-1">
                    {specialist.bio}
                  </p>
                )}
              </div>
              <span className="text-[#CBCBCB]">←</span>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => router.push("/booking/service")}
        className="w-full text-sm text-center text-[#898989] hover:text-[#242424] transition"
      >
        تغییر خدمت
      </button>
    </BookingShell>
  );
}