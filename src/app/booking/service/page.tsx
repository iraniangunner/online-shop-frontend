"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { servicesAPI } from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
import { BookingShell } from "@/app/booking/BookingShell";
import type { Service } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

export default function ServiceSelectionPage() {
  const router = useRouter();
  const branchId = useBookingStore((s) => s.branchId);
  const branchName = useBookingStore((s) => s.branchName);
  const setService = useBookingStore((s) => s.setService);

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!branchId) {
      router.replace("/booking/branch");
      return;
    }

    servicesAPI
      .list({ branch_id: branchId })
      .then((res) => setServices(res.data))
      .catch(() => setError("خطا در دریافت لیست خدمات"))
      .finally(() => setLoading(false));
  }, [branchId, router]);

  const grouped = useMemo(() => {
    const map = new Map<string, Service[]>();
    for (const service of services) {
      const categoryName = service.category?.name || "سایر خدمات";
      if (!map.has(categoryName)) map.set(categoryName, []);
      map.get(categoryName)!.push(service);
    }
    return Array.from(map.entries());
  }, [services]);

  function handleSelect(service: Service) {
    setService(service);
    router.push("/booking/specialist");
  }

  if (!branchId) return null;

  return (
    <BookingShell activeStep={1} title={`خدمات شعبه‌ی ${branchName}`}>
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

      {!loading && !error && services.length === 0 && (
        <p className="text-sm text-[#898989] text-center py-8">
          خدمتی برای این شعبه ثبت نشده است.
        </p>
      )}

      <p className="text-xs text-[#898989] text-right -mt-2">
        هر خدمت را جداگانه و در نوبت مستقل خودش رزرو می‌کنید.
      </p>

      <div className="space-y-5">
        {grouped.map(([categoryName, categoryServices]) => (
          <div key={categoryName} className="space-y-2">
            <h2 className="text-sm font-semibold text-[#898989] text-right">
              {categoryName}
            </h2>
            <div className="space-y-2">
              {categoryServices.map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleSelect(service)}
                  className="w-full text-right p-4 rounded-xl border border-[#EDEDED] hover:border-[#A72F3B]
                             hover:bg-[#FBEAEA]/40 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 text-right">
                      <p className="font-medium text-[#242424]">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-xs text-[#898989] mt-1 line-clamp-2">
                          {service.description}
                        </p>
                      )}
                    </div>
                    <div className="text-left shrink-0 space-y-0.5">
                      <p className="text-sm font-semibold text-[#A72F3B]">
                        {formatPrice(service.price)}
                      </p>
                      <p className="text-xs text-[#898989]">
                        {service.duration_minutes} دقیقه
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/booking/branch")}
        className="w-full text-sm text-center text-[#898989] hover:text-[#242424] transition"
      >
        تغییر شعبه
      </button>
    </BookingShell>
  );
}