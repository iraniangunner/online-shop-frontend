"use client";

import { useCallback, useEffect, useState } from "react";
import { specialistAPI } from "@/lib/api";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import type { Appointment } from "@/types";

function formatJalali(dateTimeStr: string) {
  const date = new Date(dateTimeStr);
  return {
    dateLabel: date.toLocaleDateString("fa-IR", { weekday: "short", day: "numeric", month: "short" }),
    timeLabel: date.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function SpecialistAppointmentsPage() {
  const [date, setDate] = useState(todayKey());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    specialistAPI
      .appointments({ date })
      .then((res) => setAppointments(res.data.data ?? res.data))
      .catch(() => setError("خطا در دریافت نوبت‌ها"))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  async function updateStatus(id: number, status: string) {
    setUpdatingId(id);
    try {
      await specialistAPI.updateAppointmentStatus(id, status);
      fetchAppointments();
    } catch {
      setError("خطا در تغییر وضعیت نوبت");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[#EDEDED] bg-white text-sm focus:outline-none focus:border-[#A72F3B]"
        />
        <h1 className="text-lg font-bold text-[#242424]">نوبت‌های امروز</h1>
      </div>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A72F3B]" />
        </div>
      )}

      {error && (
        <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
          {error}
        </p>
      )}

      {!loading && appointments.length === 0 && (
        <p className="text-sm text-[#898989] text-center py-10">
          نوبتی برای این روز ثبت نشده است.
        </p>
      )}

      <div className="space-y-3">
        {appointments.map((appointment) => {
          const { dateLabel, timeLabel } = formatJalali(appointment.starts_at);
          return (
            <div
              key={appointment.id}
              className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <StatusBadge status={appointment.status} />
                <span className="text-xs text-[#898989]">
                  {dateLabel} — <span dir="ltr">{timeLabel}</span>
                </span>
              </div>

              <div className="text-right space-y-1">
                <p className="font-medium text-[#242424]">
                  {appointment.services?.map((s) => s.name).join("، ")}
                </p>
              </div>

              {appointment.status === "confirmed" && (
                <div className="flex gap-2 pt-2 border-t border-[#EDEDED]">
                  <button
                    onClick={() => updateStatus(appointment.id, "completed")}
                    disabled={updatingId === appointment.id}
                    className="flex-1 py-2 rounded-lg bg-[#2E7D32] text-white text-xs font-medium disabled:opacity-50"
                  >
                    انجام شد
                  </button>
                  <button
                    onClick={() => updateStatus(appointment.id, "no_show")}
                    disabled={updatingId === appointment.id}
                    className="flex-1 py-2 rounded-lg border border-[#EDEDED] text-[#898989] text-xs font-medium disabled:opacity-50"
                  >
                    عدم حضور
                  </button>
                  <button
                    onClick={() => updateStatus(appointment.id, "cancelled")}
                    disabled={updatingId === appointment.id}
                    className="flex-1 py-2 rounded-lg border border-[#EDEDED] text-[#C30000] text-xs font-medium disabled:opacity-50"
                  >
                    لغو
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}