import Link from "next/link";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#FBEAEA] via-[#FBEAEA]/40 to-white">
      {/* شکل تزئینی محو در پس‌زمینه */}
      <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#A72F3B]/10 blur-3xl" />
      <div className="absolute top-40 -right-24 w-72 h-72 rounded-full bg-[#F5A623]/10 blur-3xl" />

      <div className="relative max-w-6xl mx-auto px-4 pt-16 pb-24 md:pt-24 md:pb-32 grid md:grid-cols-2 gap-12 items-center">
        {/* متن */}
        <div className="space-y-6 text-right order-2 md:order-1">
          <span className="inline-block px-3 py-1 rounded-full bg-white border border-[#EDEDED] text-xs text-[#A72F3B] font-medium">
            رزرو آنلاین، بدون تماس تلفنی
          </span>

          <h1 className="text-4xl md:text-5xl font-black text-[#242424] leading-[1.3]">
            نوبت زیبایی‌تان را
            <br />
            <span className="text-[#A72F3B]">در ۳۰ ثانیه</span> رزرو کنید
          </h1>

          <p className="text-base text-[#898989] leading-relaxed max-w-md md:mr-0 mr-auto">
            خدمات پوست، مو و لیزر با متخصصان مجرب. زمان خالی متخصص مورد نظرتان
            را همین حالا ببینید و رزرو کنید.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/booking/branch"
              className="px-6 py-3.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium text-center hover:bg-[#8f2731] transition"
            >
              رزرو نوبت
            </Link>
            <Link
              href="/services"
              className="px-6 py-3.5 rounded-xl border border-[#EDEDED] bg-white text-[#242424] text-sm font-medium text-center hover:border-[#A72F3B] transition"
            >
              مشاهده‌ی خدمات
            </Link>
          </div>
        </div>

        {/* المان تصویری: نمونه‌ی واقعی کارت تأیید نوبت، کج و شناور */}
        <div className="order-1 md:order-2 flex justify-center">
          <div className="relative w-64">
            <div className="absolute -inset-4 bg-white/40 rounded-3xl rotate-6" />
            <div className="relative bg-white rounded-2xl shadow-xl border border-[#EDEDED] p-5 space-y-3 -rotate-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg bg-[#E5F3FF] text-[#0B5CAD] text-[11px] font-medium">
                  تأیید شده
                </span>
                <span dir="ltr" className="text-[10px] text-[#CBCBCB]">
                  A3F9K2XQ
                </span>
              </div>
              <div className="space-y-1 text-right">
                <p className="text-sm font-semibold text-[#242424]">
                  پاکسازی پوست
                </p>
                <p className="text-xs text-[#898989]">
                  دکتر نمونه · شعبه مرکزی
                </p>
              </div>
              <div className="pt-2 border-t border-dashed border-[#EDEDED] flex items-center justify-between">
                <span className="text-xs text-[#898989]">۱۰:۰۰</span>
                <span className="text-xs text-[#898989]">سه‌شنبه، ۲۲ تیر</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
