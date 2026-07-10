"use client";

export function Pagination({
  currentPage,
  lastPage,
  total,
  onPageChange,
}: {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  if (lastPage <= 1) return null;

  // یه لیست کوتاه از شماره‌صفحه‌ها می‌سازه (با ... برای بازه‌های بلند)
  const pages: (number | "...")[] = [];
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || Math.abs(i - currentPage) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-between pt-2">
      <span className="text-xs text-[#898989]">مجموع: {total} مورد</span>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 rounded-lg border border-[#EDEDED] text-sm text-[#898989]
                     hover:border-[#A72F3B] hover:text-[#A72F3B] transition disabled:opacity-30 disabled:pointer-events-none"
        >
          ›
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`dots-${i}`}
              className="w-8 text-center text-xs text-[#CBCBCB]"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition ${
                p === currentPage
                  ? "bg-[#A72F3B] text-white"
                  : "border border-[#EDEDED] text-[#242424] hover:border-[#A72F3B]"
              }`}
            >
              {p}
            </button>
          ),
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === lastPage}
          className="w-8 h-8 rounded-lg border border-[#EDEDED] text-sm text-[#898989]
                     hover:border-[#A72F3B] hover:text-[#A72F3B] transition disabled:opacity-30 disabled:pointer-events-none"
        >
          ‹
        </button>
      </div>
    </div>
  );
}
