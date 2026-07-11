# کلینیک زیبایی — سیستم رزرو نوبت (فرانت‌اند)

فرانت‌اند Next.js (App Router) برای سیستم رزرو نوبت کلینیک زیبایی. شامل صفحات عمومی، فلوی کامل رزرو مشتری، و پنل‌های جدای مشتری/متخصص/ادمین.

## فناوری‌ها

| بخش | فناوری |
|---|---|
| فریم‌ورک | Next.js (App Router) |
| مدیریت state | Zustand |
| استایل | Tailwind CSS |
| جدول‌ها | TanStack Table |
| Modal/Tab | Headless UI |
| تقویم | react-multi-date-picker (تقویم جلالی) |
| نمودار | Recharts |
| تست واحد | Vitest + Testing Library |
| تست E2E | Playwright |
| فونت | IRANYekan |

## پیش‌نیازها

- Node.js >= 18
- بک‌اند لاراول در حال اجرا (به `README` بک‌اند مراجعه کن)

## نصب

```bash
npm install
cp .env.example .env.local
```

### تنظیم `.env.local`

```env
NEXT_PUBLIC_API_URL=http://onlineshop.test/api
```
(یا هر آدرسی که بک‌اند لاراولت روش سرو می‌شه)

## اجرا

```bash
npm run dev
```
روی `http://localhost:3000` بالا میاد.

## ساختار پوشه‌ها

```
app/
├── (auth)/              صفحات ورود/ثبت‌نام/فراموشی رمز (بدون Header/Footer عمومی)
├── booking/             فلوی ۵مرحله‌ای رزرو نوبت مشتری
├── payment/callback/    صفحه‌ی بازگشت از درگاه زرین‌پال
├── dashboard/           پنل مشتری (نوبت‌های من + جزئیات هر نوبت)
├── specialist/          پنل متخصص (نوبت‌ها، ساعات کاری، مرخصی)
├── admin/               پنل ادمین (داشبورد، شعبه، خدمات، متخصص، کاربران، نظرات، ریفاند)
├── services, about,
│   contact, how-it-works   صفحات عمومی (SSR با fetch مستقیم از بک‌اند)
└── _components/         کامپوننت‌های مشترک (ui/, auth/, dashboard/, layout/, home/)

store/                   Zustand stores (auth, booking)
lib/api.ts               همه‌ی توابع فراخوانی API (دسته‌بندی‌شده بر اساس نقش)
types/                   Type های TypeScript مشترک
tests/unit/              تست‌های Vitest
e2e/                     تست‌های Playwright
```

## نکات مهم معماری

- **RTL**: کل سایت `dir="rtl"` هست (تنظیم‌شده روی `<html>` توی `app/layout.tsx`). موقع نوشتن `flex`/`grid` جدید، یادت باشه ترتیب DOM باید طوری باشه که عنصر اول (که زیر RTL سمت راست میفته) محتوای اصلی/برچسب باشه، نه مقدار ثانویه.
- **رزرو تک‌خدمتی**: هر نوبت فقط شامل **یک خدمت** هست (نه چندتا با هم). اگه مشتری چند خدمت بخواد، باید کل فلو رو جدا جدا طی کنه — چون معماری پرداخت «هر نوبت = یه پرداخت مجزا»ست.
- **صفحه‌بندی**: کامپوننت `Pagination` + `DataTable` (بر پایه‌ی TanStack Table) برای همه‌ی جدول‌های پنل ادمین استفاده می‌شه.
- **تقویم جلالی**: `DateInputButton` (تک‌فیلد) و `DateRangeButton` (بازه) کامپوننت‌های اختصاصی روی `react-multi-date-picker` هستن، با آیکون و استایل هماهنگ با بقیه‌ی اپ.
- **Middleware**: مسیرهای `/dashboard`, `/booking`, `/specialist`, `/admin` نیاز به کوکی `access_token` دارن؛ بدونش خودکار به `/login?redirect=...` هدایت می‌شن.

## اجرای تست‌ها

### تست‌های واحد (Vitest) — سریع، بدون نیاز به سرور
```bash
npm run test:unit
```

### تست‌های E2E (Playwright) — نیاز به هر دو سرور در حال اجرا
```bash
# ترمینال ۱ (بک‌اند)
php artisan serve --no-reload

# ترمینال ۲ (فرانت‌اند)
npm run dev

# ترمینال ۳
npm run test:e2e
```

فرض این تست‌ها اینه که Seeder بک‌اند اجرا شده (`php artisan migrate:fresh --seed`) و حساب `customer@clinic.test` / `password123` موجوده.

⚠️ اگه دانلود مرورگر Playwright (`npx playwright install`) به‌خاطر محدودیت جغرافیایی fail داد، `playwright.config.ts` از قبل تنظیم شده که به‌جای دانلود کروم مخصوص خودش، از **Edge نصب‌شده‌ی سیستم** استفاده کنه (`channel: "msedge"`) — نیازی به دانلود نیست.

## حساب‌های تستی (از Seeder بک‌اند)

| نقش | ایمیل | پسورد |
|---|---|---|
| ادمین | `admin@clinic.test` | `password123` |
| مشتری | `customer@clinic.test` | `password123` |
| متخصص (پوست) | `specialist@clinic.test` | `password123` |
| متخصص (مو) | `specialist2@clinic.test` | `password123` |
| متخصص (لیزر) | `specialist3@clinic.test` | `password123` |