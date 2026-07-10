const CalendarIcon = () => (
  <svg
    width="18"
    height="18"
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
  </svg>
);

const ClockIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

/**
 * برای استفاده به‌عنوان render prop توی DatePicker (react-multi-date-picker).
 * withTime=true یعنی این فیلد ساعت هم داره (آیکون ساعت به‌جای تقویم نشون داده می‌شه).
 */
export function DateInputButton({
  withTime = false,
  placeholder = "انتخاب کنید",
}: {
  withTime?: boolean;
  placeholder?: string;
}) {
  return function RenderInput(value: string, openCalendar: () => void) {
    return (
      <button
        type="button"
        onClick={openCalendar}
        dir="ltr"
        className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#EDEDED] bg-white
                   text-sm text-[#242424] hover:border-[#A72F3B] transition-colors duration-200
                   focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10"
      >
        <span className="text-[#A72F3B] shrink-0">
          {withTime ? <ClockIcon /> : <CalendarIcon />}
        </span>
        <span className={value ? "text-[#242424]" : "text-[#CBCBCB]"}>
          {value || placeholder}
        </span>
      </button>
    );
  };
}
