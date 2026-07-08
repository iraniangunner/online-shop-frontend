import { ReactNode } from "react";

export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7] px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-[#EDEDED] p-6 space-y-6">
        <div className="space-y-1 text-right">
          <h1 className="text-xl font-bold text-[#242424]">{title}</h1>
          {subtitle && <p className="text-sm text-[#898989]">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
