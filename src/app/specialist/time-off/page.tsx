"use client";

import { useCallback, useEffect, useState } from "react";
import { specialistAPI } from "@/lib/api";

interface TimeOff {
  id: number;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

function formatJalali(dateTimeStr: string) {
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TimeOffPage() {
  const [list, setList] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchList = useCallback(() => {
    setLoading(true);
    specialistAPI
      .timeOff()
      .then((res) => setList(res.data))
      .catch(() => setError("خطا در دریافت لیست مرخصی‌ها"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await specialistAPI.createTimeOff({
        starts_at: startsAt,
        ends_at: endsAt,
        reason: reason || undefined,
      });
      setStartsAt("");
      setEndsAt("");
      setReason("");
      fetchList();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در ثبت مرخصی.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await specialistAPI.deleteTimeOff(id);
      fetchList();
    } catch {
      setError("خطا در حذف مرخصی.");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#242424] text-right">مرخصی‌ها</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[#898989] block text-right">
              از تاریخ/ساعت
            </label>
            <input
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#EDEDED] text-sm"
              dir="ltr"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-[#898989] block text-right">
              تا تاریخ/ساعت
            </label>
            <input
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-lg border border-[#EDEDED] text-sm"
              dir="ltr"
            />
          </div>
        </div>

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="دلیل (اختیاری)"
          className="w-full px-3 py-2 rounded-lg border border-[#EDEDED] text-sm text-right
                     placeholder:text-[#CBCBCB] focus:outline-none focus:border-[#A72F3B]"
        />

        {error && (
          <p className="text-xs text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-2.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition disabled:opacity-50"
        >
          {submitting ? "در حال ثبت..." : "ثبت مرخصی جدید"}
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A72F3B]" />
        </div>
      ) : list.length === 0 ? (
        <p className="text-sm text-[#898989] text-center py-8">
          مرخصی‌ای ثبت نشده است.
        </p>
      ) : (
        <div className="space-y-2">
          {list.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#EDEDED] p-3 flex items-center justify-between"
            >
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs text-[#C30000] hover:underline"
              >
                حذف
              </button>
              <div className="text-right">
                <p className="text-sm text-[#242424]">
                  {formatJalali(item.starts_at)} تا {formatJalali(item.ends_at)}
                </p>
                {item.reason && (
                  <p className="text-xs text-[#898989]">{item.reason}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
