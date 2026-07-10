"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { appointmentsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { AppointmentCard } from "@/app/_components/dashboard/AppointmentCard";
import type { Appointment } from "@/types";

export default function AppointmentsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = useCallback(() => {
    setLoading(true);
    appointmentsAPI
      .list()
      .then((res) => setAppointments(res.data.data ?? res.data))
      .catch(() => setError("خطا در دریافت نوبت‌ها"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard/appointments");
      return;
    }
    if (user) fetchAppointments();
  }, [user, authLoading, router, fetchAppointments]);

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] px-4 py-6">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#242424]">نوبت‌های من</h1>
          <Link
            href="/booking/branch"
            className="text-sm text-[#A72F3B] font-medium hover:underline"
          >
            + رزرو نوبت جدید
          </Link>
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

        {!loading && !error && appointments.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <p className="text-sm text-[#898989]">هنوز نوبتی ثبت نکرده‌اید.</p>
            <Link
              href="/booking/branch"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
            >
              رزرو اولین نوبت
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onUpdated={fetchAppointments}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
