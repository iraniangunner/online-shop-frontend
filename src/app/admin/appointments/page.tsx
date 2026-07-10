"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { adminAPI, branchesAPI } from "@/lib/api";
import { DataTable } from "@/app/_components/ui/DataTable";
import { Modal } from "@/app/_components/ui/Modal";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import { DateRangeButton } from "@/app/_components/ui/DateRangeButton";
import type { Appointment, Branch, Specialist, Paginated } from "@/types";

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

const STATUS_OPTIONS = [
  { value: "", label: "همه‌ی وضعیت‌ها" },
  { value: "pending_payment", label: "در انتظار پرداخت" },
  { value: "confirmed", label: "تأیید شده" },
  { value: "completed", label: "انجام شده" },
  { value: "cancelled", label: "لغو شده" },
  { value: "no_show", label: "عدم حضور" },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // فیلترها
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [specialistFilter, setSpecialistFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateObject[] | null>(null);

  // Modal تغییر وضعیت
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [activeAppointment, setActiveAppointment] =
    useState<Appointment | null>(null);
  const [newStatus, setNewStatus] = useState("confirmed");
  const [cancelReason, setCancelReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [saving, setSaving] = useState(false);

  // با ref، آخرین مقدار dateRange رو نگه می‌داریم تا تابع render (که به
  // DatePicker می‌دیم) هیچ‌وقت عوض نشه - وگرنه کتابخونه بعد از انتخاب روزِ
  // شروع، تقویم رو می‌بست و فرصت انتخاب «تا» پیش نمی‌اومد.
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

  const fetchAppointments = useCallback(() => {
    setLoading(true);

    const [rangeStart, rangeEnd] = dateRange || [];

    adminAPI.appointments
      .list({
        page,
        status: statusFilter || undefined,
        branch_id: branchFilter ? Number(branchFilter) : undefined,
        specialist_id: specialistFilter ? Number(specialistFilter) : undefined,
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
  }, [page, statusFilter, branchFilter, specialistFilter, dateRange]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    branchesAPI.list().then((res) => setBranches(res.data));
    adminAPI.specialists
      .list(1)
      .then((res) => setSpecialists(res.data.data ?? res.data));
  }, []);

  function openStatusModal(appointment: Appointment) {
    setActiveAppointment(appointment);
    setNewStatus(appointment.status);
    setCancelReason("");
    setAdminNote("");
    setStatusModalOpen(true);
  }

  async function handleUpdateStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!activeAppointment) return;

    setSaving(true);
    setError("");

    try {
      await adminAPI.appointments.updateStatus(activeAppointment.id, {
        status: newStatus,
        admin_note: adminNote || undefined,
        cancel_reason:
          newStatus === "cancelled" ? cancelReason || undefined : undefined,
      });
      setStatusModalOpen(false);
      fetchAppointments();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در تغییر وضعیت نوبت");
    } finally {
      setSaving(false);
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
        id: "customer",
        header: "مشتری",
        cell: ({ row }) => (row.original as any).user?.name || "—",
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
        cell: ({ row }) => (
          <button
            onClick={() => openStatusModal(row.original)}
            className="text-xs text-[#A72F3B] hover:underline"
          >
            تغییر وضعیت
          </button>
        ),
      },
    ],
    [],
  );

  const inputClass =
    "px-4 py-3 rounded-xl border border-[#EDEDED] text-sm text-right focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10 w-full transition";

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-bold text-[#242424] text-right">
        مدیریت نوبت‌ها
      </h1>

      {error && (
        <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
          {error}
        </p>
      )}

      {/* فیلترها */}
      <div className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setStatusFilter("");
              setBranchFilter("");
              setSpecialistFilter("");
              setDateRange(null);
              setPage(1);
            }}
            className="text-xs text-[#A72F3B] hover:underline"
          >
            پاک کردن همه‌ی فیلترها
          </button>
          <h2 className="text-sm font-bold text-[#242424]">فیلترها</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              شعبه
            </label>
            <select
              value={branchFilter}
              onChange={(e) => {
                setBranchFilter(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">همه‌ی شعبه‌ها</option>
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-[#898989] block text-right">
              متخصص
            </label>
            <select
              value={specialistFilter}
              onChange={(e) => {
                setSpecialistFilter(e.target.value);
                setPage(1);
              }}
              className={inputClass}
            >
              <option value="">همه‌ی متخصص‌ها</option>
              {specialists.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.full_name}
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
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A72F3B]" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={appointments}
          emptyMessage="نوبتی با این فیلترها یافت نشد."
          pagination={{
            currentPage: meta.currentPage,
            lastPage: meta.lastPage,
            total: meta.total,
            onPageChange: setPage,
          }}
        />
      )}

      <Modal
        open={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`تغییر وضعیت نوبت ${activeAppointment?.code ?? ""}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-3">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className={inputClass}
          >
            {STATUS_OPTIONS.filter((o) => o.value).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {newStatus === "cancelled" && (
            <input
              type="text"
              placeholder="دلیل لغو (برای اطلاع مشتری)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className={inputClass}
            />
          )}

          <textarea
            placeholder="یادداشت داخلی (اختیاری، فقط برای ادمین‌ها)"
            value={adminNote}
            onChange={(e) => setAdminNote(e.target.value)}
            rows={2}
            className={inputClass}
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? "در حال ثبت..." : "ثبت تغییر وضعیت"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
