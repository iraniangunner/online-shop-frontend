"use client";

import { useEffect, useRef, useState } from "react";

export function OtpInput({
  name,
  length = 6,
  autoFocus = true,
  onChange,
}: {
  name: string;
  length?: number;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
}) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(""));
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    onChange?.(digits.join(""));
  }, [digits, onChange]);

  function setDigitAt(index: number, char: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = char;
      return next;
    });
  }

  function handleChange(index: number, rawValue: string) {
    const value = rawValue.replace(/[^0-9]/g, "");

    if (!value) {
      setDigitAt(index, "");
      return;
    }

    // اگه کاربر چند رقم رو یهو تایپ/پیست کنه (مثلاً از کیبورد پیش‌بینی موبایل)
    if (value.length > 1) {
      const chars = value.split("").slice(0, length - index);
      setDigits((prev) => {
        const next = [...prev];
        chars.forEach((c, i) => {
          next[index + i] = c;
        });
        return next;
      });
      const nextIndex = Math.min(index + chars.length, length - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    setDigitAt(index, value);
    if (index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace") {
      if (digits[index]) {
        setDigitAt(index, "");
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        setDigitAt(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    } else if (e.key === "ArrowRight" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
    if (!pasted) return;
    e.preventDefault();

    const chars = pasted.split("").slice(0, length);
    setDigits((prev) => {
      const next = [...prev];
      chars.forEach((c, i) => {
        next[i] = c;
      });
      return next;
    });
    const lastIndex = Math.min(chars.length, length - 1);
    inputsRef.current[lastIndex]?.focus();
  }

  return (
    <div dir="ltr" className="flex justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          autoFocus={autoFocus && i === 0}
          value={digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-lg font-semibold rounded-xl border border-[#EDEDED] bg-white text-[#242424]
                     focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10
                     transition"
        />
      ))}
      <input type="hidden" name={name} value={digits.join("")} />
    </div>
  );
}
