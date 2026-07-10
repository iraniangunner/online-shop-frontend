import Link from "next/link";

const STEPS = [
  {
    number: "۱",
    title: "شعبه را انتخاب کنید",
    description:
      "نزدیک‌ترین یا مناسب‌ترین شعبه‌ی کلینیک را برای دریافت خدمات انتخاب می‌کنید.",
  },
  {
    number: "۲",
    title: "خدمت و متخصص را انتخاب کنید",
    description:
      "خدمت مورد نظر را انتخاب می‌کنید؛ سپس فقط متخصص‌هایی که آن خدمت را ارائه می‌دهند نمایش داده می‌شوند.",
  },
  {
    number: "۳",
    title: "تاریخ و ساعت خالی را ببینید",
    description:
      "تقویم واقعی متخصص را می‌بینید؛ فقط ساعت‌هایی که واقعاً خالی هستند قابل انتخاب‌اند.",
  },
  {
    number: "۴",
    title: "پرداخت آنلاین و تأیید فوری",
    description:
      "بعد از پرداخت موفق، نوبت شما بلافاصله تأیید می‌شود و پیامک/ایمیل تأیید دریافت می‌کنید.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 w-full space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-[#242424]">روند رزرو نوبت</h1>
        <p className="text-sm text-[#898989]">
          از انتخاب خدمت تا تأیید نهایی، فقط چند دقیقه زمان می‌برد
        </p>
      </div>

      <div className="space-y-6">
        {STEPS.map((step, i) => (
          <div key={step.number} className="flex gap-4 text-right">
            <div className="flex flex-col items-center">
              <span className="w-10 h-10 rounded-xl bg-[#FBEAEA] flex items-center justify-center text-[#A72F3B] font-bold shrink-0">
                {step.number}
              </span>
              {i < STEPS.length - 1 && (
                <div className="w-[2px] flex-1 bg-[#EDEDED] my-2" />
              )}
            </div>
            <div className="pb-6">
              <h3 className="font-semibold text-[#242424] mb-1">
                {step.title}
              </h3>
              <p className="text-sm text-[#898989] leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <Link
          href="/booking/branch"
          className="inline-block px-8 py-3.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
        >
          شروع رزرو نوبت
        </Link>
      </div>
    </div>
  );
}
