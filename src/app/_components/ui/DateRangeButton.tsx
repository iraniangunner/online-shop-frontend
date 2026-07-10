import type { DateObject } from "react-multi-date-picker";

const CalendarRangeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
    <line x1="8" y1="15" x2="16" y2="15" />
  </svg>
);

const XIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

/**
 * کامپوننت نمایشی برای دکمه‌ی بازه‌ی تاریخ. خودش state نداره، فقط props
 * می‌گیره و JSX برمی‌گردونه - کاملاً معمولی، بدون هوک.
 */
export function DateRangeButton({
  values,
  onClear,
  openCalendar,
  placeholder = "بازه‌ی تاریخ",
}: {
  values: DateObject[] | null;
  onClear: () => void;
  openCalendar: () => void;
  placeholder?: string;
}) {
  const [start, end] = values || [];

  let display = "";
  if (start && end) {
    display = `${start.format("DD MMM")} تا ${end.format("DD MMM")}`;
  } else if (start) {
    display = `از ${start.format("DD MMM")} — تا را هم انتخاب کنید`;
  }

  return (
    <button
      type="button"
      onClick={openCalendar}
      className="w-full flex items-center gap-2 px-4 py-3 rounded-xl border border-[#EDEDED] bg-white
                 text-sm text-[#242424] hover:border-[#A72F3B] transition-colors duration-200
                 focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10"
    >
      <span className="text-[#A72F3B] shrink-0">
        <CalendarRangeIcon />
      </span>
      <span
        className={`flex-1 text-right truncate ${display ? "text-[#242424]" : "text-[#CBCBCB]"}`}
      >
        {display || placeholder}
      </span>
      {start && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="shrink-0 text-[#CBCBCB] hover:text-[#C30000] transition-colors"
          aria-label="پاک کردن بازه‌ی تاریخ"
        >
          <XIcon />
        </span>
      )}
    </button>
  );
}
