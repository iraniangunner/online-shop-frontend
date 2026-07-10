const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  pending_payment: {
    label: "در انتظار پرداخت",
    bg: "bg-[#FFF6E5]",
    text: "text-[#B8860B]",
  },
  confirmed: { label: "تأیید شده", bg: "bg-[#E5F3FF]", text: "text-[#0B5CAD]" },
  completed: { label: "انجام شده", bg: "bg-[#EAF7EE]", text: "text-[#2E7D32]" },
  cancelled: { label: "لغو شده", bg: "bg-[#FBEAEA]", text: "text-[#C30000]" },
  no_show: { label: "عدم حضور", bg: "bg-[#F3F3F3]", text: "text-[#898989]" },
};

export function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    bg: "bg-[#F3F3F3]",
    text: "text-[#898989]",
  };

  return (
    <span
      className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}
