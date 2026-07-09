"use client";

import { useEffect, useState } from "react";

export function ResendTimer({
  seconds = 120,
  onExpire,
  resetKey,
}: {
  seconds?: number;
  onExpire?: () => void;
  resetKey: unknown;
}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    setRemaining(seconds);
  }, [resetKey, seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      onExpire?.();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining, onExpire]);

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  if (remaining <= 0) return null;

  return (
    <p className="text-xs text-center text-[#898989]" dir="ltr">
      {mm}:{ss}
    </p>
  );
}
