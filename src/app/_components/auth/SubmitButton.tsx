"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  labelPending,
  labelIdle,
  disabled = false,
}: {
  labelPending: string;
  labelIdle: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="w-full py-3 rounded-xl bg-[#A72F3B] text-white font-medium text-sm
                 transition hover:bg-[#8f2731] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? labelPending : labelIdle}
    </button>
  );
}
