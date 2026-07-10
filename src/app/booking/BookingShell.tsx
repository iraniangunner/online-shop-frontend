"use client";

import { ReactNode } from "react";

const STEPS = [
  { key: "branch", label: "شعبه" },
  { key: "service", label: "خدمت" },
  { key: "specialist", label: "متخصص" },
  { key: "datetime", label: "تاریخ و ساعت" },
  { key: "confirm", label: "تأیید" },
];

export function BookingShell({
  activeStep,
  title,
  children,
}: {
  activeStep: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-[#F7F7F7] px-4 py-6">
      <div className="max-w-lg mx-auto space-y-6">
        {/* نشانگر مراحل */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, i) => (
            <div
              key={step.key}
              className="flex items-center flex-1 last:flex-none"
            >
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors duration-300 ${
                    i < activeStep
                      ? "bg-[#A72F3B] text-white"
                      : i === activeStep
                        ? "bg-white border-2 border-[#A72F3B] text-[#A72F3B]"
                        : "bg-white border border-[#EDEDED] text-[#CBCBCB]"
                  }`}
                >
                  {i < activeStep ? "✓" : i + 1}
                </div>
                <span
                  className={`text-[10px] whitespace-nowrap ${
                    i <= activeStep ? "text-[#242424]" : "text-[#CBCBCB]"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-1 mb-4 transition-colors duration-300 ${
                    i < activeStep ? "bg-[#A72F3B]" : "bg-[#EDEDED]"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#EDEDED] p-5 space-y-4">
          <h1 className="text-lg font-bold text-[#242424] text-right">
            {title}
          </h1>
          {children}
        </div>
      </div>
    </div>
  );
}
