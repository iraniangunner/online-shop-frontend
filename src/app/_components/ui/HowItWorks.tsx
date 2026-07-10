import Link from "next/link";

const STEPS = [
  {
    number: "۱",
    title: "خدمت و متخصص را انتخاب کنید",
    description: "از بین خدمات پوست، مو و لیزر، هر چند مورد که نیاز دارید انتخاب کنید.",
  },
  {
    number: "۲",
    title: "زمان خالی را ببینید",
    description: "تقویم واقعی متخصص را می‌بینید و ساعت خالی را انتخاب می‌کنید.",
  },
  {
    number: "۳",
    title: "پرداخت و تأیید فوری",
    description: "پرداخت آنلاین انجام می‌شود و نوبت شما بلافاصله تأیید می‌شود.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 py-20">
      <div className="text-center mb-12 space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold text-[#242424]">
          رزرو نوبت در ۳ قدم
        </h2>
        <p className="text-sm text-[#898989]">همه‌چیز آنلاین، بدون نیاز به تماس تلفنی</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {STEPS.map((step, i) => (
          <div key={step.number} className="relative">
            <div className="bg-white rounded-2xl border border-[#EDEDED] p-6 h-full space-y-3 text-right">
              <span className="inline-flex w-10 h-10 rounded-xl bg-[#FBEAEA] items-center justify-center text-[#A72F3B] font-bold">
                {step.number}
              </span>
              <h3 className="font-semibold text-[#242424]">{step.title}</h3>
              <p className="text-sm text-[#898989] leading-relaxed">
                {step.description}
              </p>
            </div>
            {i < STEPS.length - 1 && (
              <div className="hidden md:block absolute top-1/2 -left-3 w-6 h-[2px] bg-[#EDEDED]" />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          href="/how-it-works"
          className="text-sm text-[#A72F3B] font-medium hover:underline"
        >
          جزئیات کامل روند رزرو ←
        </Link>
      </div>
    </section>
  );
}