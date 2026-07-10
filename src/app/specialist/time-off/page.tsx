"use client";

import { useCallback, useEffect, useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import TimePicker from "react-multi-date-picker/plugins/time_picker";
import { specialistAPI } from "@/lib/api";
import { DateInputButton } from "@/app/_components/ui/DateInputButton";

interface TimeOff {
  id: number;
  starts_at: string;
  ends_at: string;
  reason: string | null;
}

function formatJalali(dateTimeStr: string) {
  const date = new Date(dateTimeStr);
  const dayMonth = date.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "short",
  });
  const timeLabel = date.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dayMonth} - ${timeLabel}`;
}

// تاریخ (فقط روز/ماه/سال) و ساعت (فقط ساعت/دقیقه) رو که جدا از هم انتخاب شدن،
// با هم ترکیب می‌کنه و یه رشته‌ی ISO میلادی برای بک‌اند می‌سازه
function combineDateAndTime(
  date: DateObject | null,
  time: DateObject | null,
): string {
  if (!date || !time) return "";

  const d = date.toDate();
  const t = time.toDate();

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(t.getHours()).padStart(2, "0");
  const min = String(t.getMinutes()).padStart(2, "0");

  return `${y}-${m}-${day}T${h}:${min}`;
}

export default function TimeOffPage() {
  const [list, setList] = useState<TimeOff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState<DateObject | null>(null);
  const [startTime, setStartTime] = useState<DateObject | null>(null);
  const [endDate, setEndDate] = useState<DateObject | null>(null);
  const [endTime, setEndTime] = useState<DateObject | null>(null);
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

    if (!startDate || !startTime || !endDate || !endTime) {
      setError("تاریخ و ساعت شروع و پایان را کامل انتخاب کنید.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await specialistAPI.createTimeOff({
        starts_at: combineDateAndTime(startDate, startTime),
        ends_at: combineDateAndTime(endDate, endTime),
        reason: reason || undefined,
      });
      setStartDate(null);
      setStartTime(null);
      setEndDate(null);
      setEndTime(null);
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
        className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-4"
      >
        {/* شروع مرخصی: تاریخ و ساعت دو تا کنترل جدا */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#898989] block text-right">
            شروع مرخصی
          </label>
          <div className="grid grid-cols-2 gap-2">
            <DatePicker
              value={startDate}
              onChange={(value) => setStartDate(value as DateObject)}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              render={DateInputButton({ placeholder: "تاریخ" })}
            />
            <DatePicker
              value={startTime}
              onChange={(value) => setStartTime(value as DateObject)}
              disableDayPicker
              format="HH:mm"
              calendar={persian}
              locale={persian_fa}
              plugins={[<TimePicker key="time" hideSeconds />]}
              calendarPosition="bottom-right"
              render={DateInputButton({ withTime: true, placeholder: "ساعت" })}
            />
          </div>
        </div>

        {/* پایان مرخصی: تاریخ و ساعت دو تا کنترل جدا */}
        <div className="space-y-1.5">
          <label className="text-xs text-[#898989] block text-right">
            پایان مرخصی
          </label>
          <div className="grid grid-cols-2 gap-2">
            <DatePicker
              value={endDate}
              onChange={(value) => setEndDate(value as DateObject)}
              calendar={persian}
              locale={persian_fa}
              format="YYYY/MM/DD"
              calendarPosition="bottom-right"
              render={DateInputButton({ placeholder: "تاریخ" })}
            />
            <DatePicker
              value={endTime}
              onChange={(value) => setEndTime(value as DateObject)}
              disableDayPicker
              format="HH:mm"
              calendar={persian}
              locale={persian_fa}
              plugins={[<TimePicker key="time" hideSeconds />]}
              calendarPosition="bottom-right"
              render={DateInputButton({ withTime: true, placeholder: "ساعت" })}
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
              <div className="text-right">
                <p className="text-sm text-[#242424]">
                  {formatJalali(item.starts_at)} تا {formatJalali(item.ends_at)}
                </p>
                {item.reason && (
                  <p className="text-xs text-[#898989]">{item.reason}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(item.id)}
                className="text-xs text-[#C30000] hover:underline"
              >
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
