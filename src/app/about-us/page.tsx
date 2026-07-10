const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getStats() {
  try {
    const [branchesRes, servicesRes] = await Promise.all([
      fetch(`${API_URL}/branches`, { next: { revalidate: 300 } }),
      fetch(`${API_URL}/services`, { next: { revalidate: 300 } }),
    ]);

    const branches = branchesRes.ok ? await branchesRes.json() : [];
    const services = servicesRes.ok ? await servicesRes.json() : [];

    return {
      branchCount: Array.isArray(branches) ? branches.length : 0,
      serviceCount: Array.isArray(services) ? services.length : 0,
    };
  } catch {
    return { branchCount: 0, serviceCount: 0 };
  }
}

export default async function AboutPage() {
  const { branchCount, serviceCount } = await getStats();

  const stats = [
    { value: `${branchCount || "-"}`, label: "شعبه فعال" },
    { value: `${serviceCount || "-"}`, label: "خدمت تخصصی" },
    { value: "۱۰+", label: "سال سابقه" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-4 py-16 text-right space-y-6">
          <h1 className="text-3xl font-bold text-[#242424]">درباره‌ی ما</h1>
          <p className="text-[#898989] leading-loose">
            کلینیک زیبایی ما با هدف ارائه‌ی خدمات تخصصی پوست، مو و لیزر در محیطی
            آرام و حرفه‌ای تأسیس شده است. تیم ما را متخصصانی با سال‌ها تجربه‌ی
            بالینی تشکیل می‌دهند که همراه با جدیدترین تجهیزات روز دنیا، بهترین
            نتیجه را برای شما رقم می‌زنند.
          </p>
          <p className="text-[#898989] leading-loose">
            با راه‌اندازی سیستم رزرو آنلاین، تلاش کرده‌ایم تجربه‌ی دریافت نوبت
            را ساده‌تر و سریع‌تر کنیم؛ بدون نیاز به تماس تلفنی و انتظار،
            می‌توانید در هر ساعت از شبانه‌روز، نوبت خود را رزرو کنید.
          </p>
        </section>

        <section className="bg-[#F7F7F7] py-14">
          <div className="max-w-3xl mx-auto px-4 grid grid-cols-3 gap-4 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="space-y-1">
                <p className="text-3xl font-black text-[#A72F3B]">
                  {stat.value}
                </p>
                <p className="text-xs text-[#898989]">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-3xl mx-auto px-4 py-16 text-right space-y-4">
          <h2 className="text-xl font-bold text-[#242424]">تعهد ما</h2>
          <ul className="space-y-3 text-[#898989]">
            <li className="flex items-start gap-2">
              <span className="text-[#A72F3B] mt-0.5">•</span>
              <span>استفاده از مواد و تجهیزات استاندارد و باکیفیت</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#A72F3B] mt-0.5">•</span>
              <span>شفافیت کامل در قیمت‌گذاری خدمات، پیش از رزرو</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#A72F3B] mt-0.5">•</span>
              <span>رعایت کامل اصول بهداشتی و استریلیزاسیون</span>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
