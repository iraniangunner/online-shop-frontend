"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { appointmentsAPI } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { DataTable } from "@/app/_components/ui/DataTable";
import { Modal } from "@/app/_components/ui/Modal";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import { DateRangeButton } from "@/app/_components/ui/DateRangeButton";
import type { Appointment, Paginated } from "@/types";

const STATUS_OPTIONS = [
  { value: "", label: "همه‌ی وضعیت‌ها" },
  { value: "pending_payment", label: "در انتظار پرداخت" },
  { value: "confirmed", label: "تأیید شده" },
  { value: "completed", label: "انجام شده" },
  { value: "cancelled", label: "لغو شده" },
  { value: "no_show", label: "عدم حضور" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
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
  return { dayMonth, timeLabel };
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function AppointmentsPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const authLoading = useAuthStore((s) => s.loading);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateObject[] | null>(null);

  // Modal لغو نوبت
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelling, setCancelling] = useState(false);

  // Modal ثبت نظر
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Appointment | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchAppointments = useCallback(() => {
    setLoading(true);

    const [rangeStart, rangeEnd] = dateRange || [];

    appointmentsAPI
      .list({
        page,
        status: statusFilter || undefined,
        date_from: rangeStart ? toDateKey(rangeStart.toDate()) : undefined,
        date_to: rangeEnd ? toDateKey(rangeEnd.toDate()) : undefined,
      })
      .then((res) => {
        const paginated = res.data as Paginated<Appointment>;
        setAppointments(paginated.data);
        setMeta({
          currentPage: paginated.current_page,
          lastPage: paginated.last_page,
          total: paginated.total,
        });
      })
      .catch(() => setError("خطا در دریافت نوبت‌ها"))
      .finally(() => setLoading(false));
  }, [page, statusFilter, dateRange]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/dashboard/appointments");
      return;
    }
    if (user) fetchAppointments();
  }, [user, authLoading, router, fetchAppointments]);

  // رفرنس پایدار برای دکمه‌ی بازه‌ی تاریخ (تا انتخاب «تا» درست کار کنه)
  const dateRangeRef = useRef<DateObject[] | null>(dateRange);
  dateRangeRef.current = dateRange;

  const renderDateRangeInput = useCallback(
    (_value: string, openCalendar: () => void) => (
      <DateRangeButton
        values={dateRangeRef.current}
        openCalendar={openCalendar}
        onClear={() => {
          setDateRange(null);
          setPage(1);
        }}
      />
    ),
    [],
  );

  function openCancelModal(appointment: Appointment) {
    setCancelTarget(appointment);
    setCancelModalOpen(true);
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await appointmentsAPI.cancel(cancelTarget.id);
      setCancelModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در لغو نوبت");
    } finally {
      setCancelling(false);
    }
  }

  function openReviewModal(appointment: Appointment) {
    setReviewTarget(appointment);
    setRating(5);
    setComment("");
    setReviewModalOpen(true);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewTarget) return;
    setSubmittingReview(true);
    try {
      await appointmentsAPI.review(reviewTarget.id, {
        rating,
        comment: comment || undefined,
      });
      setReviewModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در ثبت نظر");
    } finally {
      setSubmittingReview(false);
    }
  }

  const columns = useMemo<ColumnDef<Appointment, any>[]>(
    () => [
      {
        accessorKey: "code",
        header: "کد رهگیری",
        cell: ({ row }) => (
          <span dir="ltr" className="text-xs text-[#898989]">
            {row.original.code}
          </span>
        ),
      },
      {
        id: "services",
        header: "خدمت",
        cell: ({ row }) =>
          row.original.services?.map((s) => s.name).join("، ") || "—",
      },
      {
        id: "specialist",
        header: "متخصص",
        cell: ({ row }) => row.original.specialist?.full_name || "—",
      },
      {
        id: "datetime",
        header: "تاریخ و ساعت",
        cell: ({ row }) => {
          const { dayMonth, timeLabel } = formatJalali(row.original.starts_at);
          return (
            <span>
              {dayMonth} — <span dir="ltr">{timeLabel}</span>
            </span>
          );
        },
      },
      {
        accessorKey: "total_price",
        header: "مبلغ",
        cell: ({ row }) => (
          <span className="text-[#A72F3B] font-medium">
            {formatPrice(row.original.total_price)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => {
          const appointment = row.original;
          const isUpcoming = new Date(appointment.starts_at) > new Date();
          const canCancel =
            (appointment.status === "confirmed" ||
              appointment.status === "pending_payment") &&
            isUpcoming;
          const canReview =
            appointment.status === "completed" && !appointment.review;

          if (!canCancel && !canReview)
            return <span className="text-xs text-[#CBCBCB]">—</span>;

          return (
            <div className="flex gap-3">
              {canCancel && (
                <button
                  onClick={() => openCancelModal(appointment)}
                  className="text-xs text-[#C30000] hover:underline"
                >
                  لغو
                </button>
              )}
              {canReview && (
                <button
                  onClick={() => openReviewModal(appointment)}
                  className="text-xs text-[#A72F3B] hover:underline"
                >
                  ثبت نظر
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const inputClass =
    "px-4 py-3 rounded-xl border border-[#EDEDED] text-sm text-right focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10 w-full transition";

  if (authLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F7] px-4 py-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-[#242424]">نوبت‌های من</h1>
          <Link
            href="/booking/branch"
            className="text-sm text-[#A72F3B] font-medium hover:underline"
          >
            + رزرو نوبت جدید
          </Link>
        </div>

        {/* فیلترها */}
        <div className="bg-white rounded-2xl border border-[#EDEDED] p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-[#898989] block text-right">
              وضعیت
            </label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#898989] block text-right">
              بازه‌ی تاریخ
            </label>
            <DatePicker
              value={dateRange || undefined}
              onChange={(value) => {
                setDateRange(value as DateObject[]);
                setPage(1);
              }}
              range
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              render={renderDateRangeInput}
            />
          </div>
        </div>

        {error && (
          <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A72F3B]" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 space-y-3 bg-white rounded-2xl border border-[#EDEDED]">
            <p className="text-sm text-[#898989]">
              نوبتی با این فیلترها یافت نشد.
            </p>
            <Link
              href="/booking/branch"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
            >
              رزرو اولین نوبت
            </Link>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={appointments}
            emptyMessage="نوبتی یافت نشد."
            pagination={{
              currentPage: meta.currentPage,
              lastPage: meta.lastPage,
              total: meta.total,
              onPageChange: setPage,
            }}
          />
        )}
      </div>

      {/* Modal لغو نوبت */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="لغو نوبت"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#242424] text-right">
            آیا از لغو نوبت با کد <span dir="ltr">{cancelTarget?.code}</span>{" "}
            مطمئن هستید؟
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="flex-1 py-2.5 rounded-xl bg-[#C30000] text-white text-sm font-medium disabled:opacity-50"
            >
              {cancelling ? "در حال لغو..." : "بله، لغو کن"}
            </button>
            <button
              onClick={() => setCancelModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl border border-[#EDEDED] text-[#242424] text-sm font-medium"
            >
              انصراف
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal ثبت نظر */}
      <Modal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="ثبت نظر"
      >
        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div className="flex justify-center gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className="text-3xl leading-none transition-transform hover:scale-110"
              >
                <span
                  className={n <= rating ? "text-[#F5A623]" : "text-[#EDEDED]"}
                >
                  ★
                </span>
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="نظر شما (اختیاری)"
            rows={3}
            className={inputClass}
          />
          <button
            type="submit"
            disabled={submittingReview}
            className="w-full py-2.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium disabled:opacity-50"
          >
            {submittingReview ? "در حال ثبت..." : "ثبت نظر"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
