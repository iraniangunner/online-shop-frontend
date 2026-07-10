import type { Branch } from "@/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function getBranches(): Promise<Branch[]> {
  try {
    const res = await fetch(`${API_URL}/branches`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export default async function ContactPage() {
  const branches = await getBranches();

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 w-full space-y-10">
        <div className="text-right space-y-2">
          <h1 className="text-3xl font-bold text-[#242424]">تماس با ما</h1>
          <p className="text-sm text-[#898989]">
            برای سؤالات عمومی، ایمیل بزنید؛ برای رزرو نوبت، از دکمه‌ی رزرو
            آنلاین استفاده کنید.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#EDEDED] p-5 text-right space-y-1">
            <p className="text-xs text-[#898989]">ایمیل</p>
            <p
              dir="ltr"
              className="text-sm font-medium text-[#242424] text-right"
            >
              info@clinic.test
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#EDEDED] p-5 text-right space-y-1">
            <p className="text-xs text-[#898989]">ساعات پاسخگویی</p>
            <p className="text-sm font-medium text-[#242424]">
              شنبه تا چهارشنبه، ۹ تا ۱۷
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#242424] text-right">
            شعبه‌های ما
          </h2>

          {branches.length === 0 ? (
            <p className="text-sm text-[#898989] text-center py-10">
              اطلاعات شعبه‌ای برای نمایش وجود ندارد.
            </p>
          ) : (
            <div className="space-y-3">
              {branches.map((branch) => (
                <div
                  key={branch.id}
                  className="bg-white rounded-2xl border border-[#EDEDED] p-5 text-right space-y-1"
                >
                  <p className="font-semibold text-[#242424]">{branch.name}</p>
                  {branch.address && (
                    <p className="text-sm text-[#898989]">{branch.address}</p>
                  )}
                  {branch.phone && (
                    <p dir="ltr" className="text-sm text-[#898989] text-right">
                      {branch.phone}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
