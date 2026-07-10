"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { branchesAPI } from "@/lib/api";
import { useBookingStore } from "@/store/bookingStore";
import { BookingShell } from "@/app/booking/BookingShell";
import type { Branch } from "@/types";

export default function BranchSelectionPage() {
  const router = useRouter();
  const setBranch = useBookingStore((s) => s.setBranch);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    branchesAPI
      .list()
      .then((res) => setBranches(res.data))
      .catch(() => setError("خطا در دریافت لیست شعبه‌ها"))
      .finally(() => setLoading(false));
  }, []);

  function handleSelect(branch: Branch) {
    setBranch(branch.id, branch.name);
    router.push("/booking/service");
  }

  return (
    <BookingShell activeStep={0} title="شعبه‌ی مورد نظرتان را انتخاب کنید">
      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A72F3B]" />
        </div>
      )}

      {error && (
        <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
          {error}
        </p>
      )}

      {!loading && !error && branches.length === 0 && (
        <p className="text-sm text-[#898989] text-center py-8">
          در حال حاضر شعبه‌ای برای رزرو در دسترس نیست.
        </p>
      )}

      <div className="space-y-3">
        {branches.map((branch) => (
          <button
            key={branch.id}
            onClick={() => handleSelect(branch)}
            className="w-full p-4 rounded-xl border border-[#EDEDED] hover:border-[#A72F3B]
                       hover:bg-[#FBEAEA]/40 transition-colors duration-200 group"
          >
            <div className="flex items-center justify-between">
              <div className="text-right">
                <p className="font-medium text-[#242424]">{branch.name}</p>
                {branch.address && (
                  <p className="text-xs text-[#898989] mt-1">
                    {branch.address}
                  </p>
                )}
              </div>
              <span className="text-[#CBCBCB] group-hover:text-[#A72F3B] transition-colors">
                ←
              </span>
            </div>
          </button>
        ))}
      </div>
    </BookingShell>
  );
}
