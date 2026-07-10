import Link from "next/link";
import type { Service } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_URL}/services`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

export default async function ServicesPage() {
  const services = await getServices();

  const grouped = new Map<string, Service[]>();
  for (const service of services) {
    const categoryName = service.category?.name || "سایر خدمات";
    if (!grouped.has(categoryName)) grouped.set(categoryName, []);
    grouped.get(categoryName)!.push(service);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 w-full space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-[#242424]">خدمات ما</h1>
          <p className="text-sm text-[#898989]">
            مجموعه‌ی کامل خدمات پوست، مو و لیزر با قیمت و مدت‌زمان مشخص
          </p>
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-[#898989] text-center py-16">
            در حال حاضر خدمتی برای نمایش وجود ندارد.
          </p>
        ) : (
          Array.from(grouped.entries()).map(
            ([categoryName, categoryServices]) => (
              <div key={categoryName} className="space-y-4">
                <h2 className="text-lg font-bold text-[#242424] border-r-4 border-[#A72F3B] pr-3">
                  {categoryName}
                </h2>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {categoryServices.map((service) => (
                    <div
                      key={service.id}
                      className="bg-white rounded-2xl border border-[#EDEDED] p-5 space-y-2 text-right"
                    >
                      <p className="font-semibold text-[#242424]">
                        {service.name}
                      </p>
                      {service.description && (
                        <p className="text-xs text-[#898989] leading-relaxed line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-[#EDEDED]">
                        <span className="text-xs text-[#898989]">
                          {service.duration_minutes} دقیقه
                        </span>
                        <span className="text-sm font-semibold text-[#A72F3B]">
                          {formatPrice(service.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )
        )}

        <div className="text-center pt-4">
          <Link
            href="/booking/branch"
            className="inline-block px-8 py-3.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
          >
            رزرو نوبت
          </Link>
        </div>
      </main>
    </div>
  );
}
