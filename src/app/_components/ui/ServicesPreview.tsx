import Link from "next/link";
import type { Service } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getServices(): Promise<Service[]> {
  try {
    const res = await fetch(`${API_URL}/services`, {
      // هر ۶۰ ثانیه یه بار دوباره از بک‌اند تازه می‌شه (ISR)، نه در هر درخواست
      next: { revalidate: 60 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    return Array.isArray(data) ? data.slice(0, 6) : [];
  } catch {
    return [];
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

export async function ServicesPreview() {
  const services = await getServices();

  return (
    <section id="services" className="bg-[#F7F7F7] py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-[#242424] text-right">
            خدمات ما
          </h2>
          <Link
            href="/services"
            className="text-sm text-[#A72F3B] font-medium hover:underline"
          >
            مشاهده‌ی همه ←
          </Link>
        </div>

        {services.length === 0 ? (
          <p className="text-sm text-[#898989] text-center py-10">
            به‌زودی خدمات اینجا نمایش داده می‌شود.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {services.map((service) => (
              <Link
                key={service.id}
                href="/booking/branch"
                className="bg-white rounded-2xl border border-[#EDEDED] p-5 space-y-2 text-right
                           hover:border-[#A72F3B] hover:shadow-sm transition-all duration-200"
              >
                <p className="font-semibold text-[#242424]">{service.name}</p>
                {service.description && (
                  <p className="text-xs text-[#898989] line-clamp-2">
                    {service.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-[#898989]">
                    {service.duration_minutes} دقیقه
                  </span>
                  <span className="text-sm font-semibold text-[#A72F3B]">
                    {formatPrice(service.price)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
