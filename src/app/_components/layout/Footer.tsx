import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#242424] text-white/70">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-[#A72F3B] flex items-center justify-center text-white font-bold text-sm">
              ک
            </span>
            <span className="font-bold text-white text-base">کلینیک زیبایی</span>
          </div>
          <p className="text-sm leading-relaxed">
            خدمات تخصصی پوست، مو و زیبایی با متخصصان مجرب و امکان رزرو آنلاین
            نوبت.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">دسترسی سریع</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/services" className="hover:text-white transition-colors">
                خدمات
              </Link>
            </li>
            <li>
              <Link href="/how-it-works" className="hover:text-white transition-colors">
                روند رزرو
              </Link>
            </li>
            <li>
              <Link href="/about-us" className="hover:text-white transition-colors">
                درباره ما
              </Link>
            </li>
            <li>
              <Link href="/booking/branch" className="hover:text-white transition-colors">
                رزرو نوبت
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <h3 className="text-white font-medium text-sm">تماس با ما</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="/contact-us" className="hover:text-white transition-colors">
                اطلاعات تماس و شعبه‌ها
              </Link>
            </li>
            <li dir="ltr" className="text-right">
              info@clinic.test
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <p className="text-center text-xs text-white/40">
          © {new Date().getFullYear()} کلینیک زیبایی. تمامی حقوق محفوظ است.
        </p>
      </div>
    </footer>
  );
}