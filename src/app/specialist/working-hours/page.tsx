"use client";

import { useEffect, useState } from "react";
import { specialistAPI, branchesAPI } from "@/lib/api";
import type { Branch } from "@/types";

const DAYS = [
  { value: 6, label: "شنبه" },
  { value: 0, label: "یکشنبه" },
  { value: 1, label: "دوشنبه" },
  { value: 2, label: "سه‌شنبه" },
  { value: 3, label: "چهارشنبه" },
  { value: 4, label: "پنجشنبه" },
  { value: 5, label: "جمعه" },
];

interface DayRow {
  enabled: boolean;
  start_time: string;
  end_time: string;
}

export default function WorkingHoursPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchId, setBranchId] = useState<number | null>(null);
  const [rows, setRows] = useState<Record<number, DayRow>>(
    Object.fromEntries(
      DAYS.map((d) => [
        d.value,
        { enabled: false, start_time: "09:00", end_time: "17:00" },
      ]),
    ),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    branchesAPI.list().then((res) => {
      setBranches(res.data);
      if (res.data.length > 0) setBranchId(res.data[0].id);
    });
  }, []);

  useEffect(() => {
    if (!branchId) return;

    setLoading(true);
    specialistAPI
      .workingHours()
      .then((res) => {
        const existing = res.data.filter(
          (wh: any) => wh.branch_id === branchId,
        );
        setRows((prev) => {
          const next = { ...prev };
          for (const day of DAYS) {
            const match = existing.find(
              (wh: any) => wh.day_of_week === day.value,
            );
            next[day.value] = match
              ? {
                  enabled: true,
                  start_time: match.start_time.slice(0, 5),
                  end_time: match.end_time.slice(0, 5),
                }
              : { enabled: false, start_time: "09:00", end_time: "17:00" };
          }
          return next;
        });
      })
      .catch(() => setError("خطا در دریافت ساعات کاری"))
      .finally(() => setLoading(false));
  }, [branchId]);

  function updateRow(day: number, patch: Partial<DayRow>) {
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], ...patch } }));
  }

  async function handleSave() {
    if (!branchId) return;

    setSaving(true);
    setMessage("");
    setError("");

    const hours = DAYS.filter((d) => rows[d.value].enabled).map((d) => ({
      day_of_week: d.value,
      start_time: rows[d.value].start_time,
      end_time: rows[d.value].end_time,
    }));

    try {
      await specialistAPI.replaceWorkingHours(branchId, hours);
      setMessage("ساعات کاری با موفقیت ذخیره شد.");
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در ذخیره‌ی ساعات کاری.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#242424] text-right">
        ساعات کاری
      </h1>

      {branches.length > 1 && (
        <select
          value={branchId ?? ""}
          onChange={(e) => setBranchId(Number(e.target.value))}
          className="w-full px-3 py-2.5 rounded-xl border border-[#EDEDED] bg-white text-sm text-right"
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      )}

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A72F3B]" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3">
          {DAYS.map((day) => {
            const row = rows[day.value];
            return (
              <div
                key={day.value}
                className="flex items-center gap-3 py-2 border-b border-[#EDEDED] last:border-0"
              >
                <label className="flex items-center gap-2 w-20 shrink-0">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) =>
                      updateRow(day.value, { enabled: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#A72F3B]"
                  />
                  <span className="text-sm text-[#242424]">{day.label}</span>
                </label>

                {row.enabled && (
                  <div className="flex items-center gap-2 flex-1" dir="ltr">
                    <input
                      type="time"
                      value={row.start_time}
                      onChange={(e) =>
                        updateRow(day.value, { start_time: e.target.value })
                      }
                      className="px-2 py-1.5 rounded-lg border border-[#EDEDED] text-sm flex-1"
                    />
                    <span className="text-[#898989] text-xs">تا</span>
                    <input
                      type="time"
                      value={row.end_time}
                      onChange={(e) =>
                        updateRow(day.value, { end_time: e.target.value })
                      }
                      className="px-2 py-1.5 rounded-lg border border-[#EDEDED] text-sm flex-1"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {message && (
        <p className="text-sm text-[#2E7D32] bg-[#EAF7EE] px-3 py-2 rounded-lg text-right">
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={saving || loading}
        className="w-full py-3 rounded-xl bg-[#A72F3B] text-white font-medium text-sm hover:bg-[#8f2731] transition disabled:opacity-50"
      >
        {saving ? "در حال ذخیره..." : "ذخیره‌ی ساعات کاری"}
      </button>
    </div>
  );
}
