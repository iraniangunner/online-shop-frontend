"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { appointmentsAPI } from "@/lib/api";
import { Modal } from "@/app/_components/ui/Modal";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import type { Appointment } from "@/types";

interface Payment {
  id: number;
  amount: number;
  status: string;
  ref_id: string | null;
  paid_at: string | null;
  created_at: string;
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار پرداخت",
  paid: "پرداخت‌شده",
  failed: "ناموفق",
  refund_pending: "در انتظار ریفاند",
  refunded: "ریفاندشده",
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

function formatJalaliDate(dateTimeStr: string) {
  const date = new Date(dateTimeStr);
  const weekday = date.toLocaleDateString("fa-IR", { weekday: "long" });
  const dayMonth = date.toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "long",
  });
  const year = date.toLocaleDateString("fa-IR", { year: "numeric" });
  return `${weekday}، ${dayMonth} ${year}`;
}

function formatJalaliTime(dateTimeStr: string) {
  return new Date(dateTimeStr).toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params.id);

  const [appointment, setAppointment] = useState<
    (Appointment & { payments?: Payment[] }) | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchAppointment = useCallback(() => {
    setLoading(true);
    appointmentsAPI
      .show(id)
      .then((res) => setAppointment(res.data))
      .catch((err) => {
        if (err?.response?.status === 403) {
          setError("این نوبت متعلق به شما نیست.");
        } else if (err?.response?.status === 404) {
          setError("نوبتی با این مشخصات یافت نشد.");
        } else {
          setError("خطا در دریافت جزئیات نوبت.");
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchAppointment();
  }, [fetchAppointment]);

  async function handleConfirmCancel() {
    if (!appointment) return;
    setCancelling(true);
    try {
      await appointmentsAPI.cancel(appointment.id);
      setCancelModalOpen(false);
      fetchAppointment();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در لغو نوبت");
    } finally {
      setCancelling(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!appointment) return;
    setSubmittingReview(true);
    try {
      await appointmentsAPI.review(appointment.id, {
        rating,
        comment: comment || undefined,
      });
      setReviewModalOpen(false);
      fetchAppointment();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در ثبت نظر");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F7F7]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-[#F7F7F7] px-4 py-6">
        <div className="max-w-lg mx-auto space-y-4 text-center py-16">
          <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg inline-block">
            {error || "خطایی رخ داد."}
          </p>
          <div>
            <Link
              href="/dashboard/appointments"
              className="text-sm text-[#A72F3B] font-medium hover:underline"
            >
              بازگشت به لیست نوبت‌ها
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isUpcoming = new Date(appointment.starts_at) > new Date();
  const canCancel =
    (appointment.status === "confirmed" ||
      appointment.status === "pending_payment") &&
    isUpcoming;
  const canReview = appointment.status === "completed" && !appointment.review;

  const inputClass =
    "px-4 py-3 rounded-xl border border-[#EDEDED] text-sm text-right focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10 w-full transition";

  return (
    <div className="min-h-screen bg-[#F7F7F7] px-4 py-6">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/appointments"
            className="text-sm text-[#A72F3B] font-medium hover:underline"
          >
            بازگشت
          </Link>
          <h1 className="text-lg font-bold text-[#242424]">جزئیات نوبت</h1>
        </div>

        {/* کارت اصلی */}
        <div className="bg-white rounded-2xl border border-[#EDEDED] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <StatusBadge status={appointment.status} />
            <div className="text-right">
              <p className="text-xs text-[#898989]">کد رهگیری</p>
              <p dir="ltr" className="text-sm font-bold text-[#242424]">
                {appointment.code}
              </p>
            </div>
          </div>

          <div className="space-y-3 border-t border-[#EDEDED] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#898989]">شعبه</span>
              <span className="text-sm text-[#242424] font-medium">
                {appointment.branch?.name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#898989]">متخصص</span>
              <span className="text-sm text-[#242424] font-medium">
                {appointment.specialist?.full_name}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-[#898989]">تاریخ و ساعت</span>
              <div className="text-left">
                <p className="text-sm text-[#242424] font-medium">
                  {formatJalaliDate(appointment.starts_at)}
                </p>
                <p dir="ltr" className="text-xs text-[#898989]">
                  {formatJalaliTime(appointment.starts_at)}
                </p>
              </div>
            </div>
          </div>

          {/* خدمات */}
          <div className="border-t border-[#EDEDED] pt-4 space-y-2">
            <p className="text-xs text-[#898989]">خدمات</p>
            {appointment.services?.map((s) => (
              <div key={s.id} className="flex items-center justify-between">
                <span className="text-sm text-[#242424]">{s.name}</span>
                <span className="text-xs text-[#898989]">
                  {formatPrice(s.price)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-[#EDEDED] pt-4 flex items-center justify-between">
            <span className="text-sm text-[#242424] font-medium">مبلغ کل</span>
            <span className="text-lg font-bold text-[#A72F3B]">
              {formatPrice(appointment.total_price)}
            </span>
          </div>
        </div>

        {/* تاریخچه‌ی پرداخت */}
        {appointment.payments && appointment.payments.length > 0 && (
          <div className="bg-white rounded-2xl border border-[#EDEDED] p-5 space-y-3">
            <h2 className="text-sm font-bold text-[#242424] text-right">
              تاریخچه‌ی پرداخت
            </h2>
            <div className="space-y-2">
              {appointment.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between bg-[#F7F7F7] rounded-lg px-3 py-2"
                >
                  <span className="text-xs text-[#898989]">
                    {PAYMENT_STATUS_LABELS[p.status] || p.status}
                  </span>
                  <div className="text-right">
                    <p className="text-sm text-[#242424]">
                      {formatPrice(p.amount)}
                    </p>
                    {p.ref_id && (
                      <p dir="ltr" className="text-xs text-[#898989]">
                        کد پیگیری: {p.ref_id}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* نظر ثبت‌شده */}
        {appointment.review && (
          <div className="bg-white rounded-2xl border border-[#EDEDED] p-5 space-y-2">
            <h2 className="text-sm font-bold text-[#242424] text-right">
              نظر شما
            </h2>
            <div dir="ltr" className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <span
                  key={n}
                  className={
                    n <= appointment.review!.rating
                      ? "text-[#F5A623]"
                      : "text-[#EDEDED]"
                  }
                >
                  ★
                </span>
              ))}
            </div>
            {appointment.review.comment && (
              <p className="text-sm text-[#898989] text-right">
                {appointment.review.comment}
              </p>
            )}
          </div>
        )}

        {/* اکشن‌ها */}
        {(canCancel || canReview) && (
          <div className="flex gap-2">
            {canReview && (
              <button
                onClick={() => setReviewModalOpen(true)}
                className="flex-1 py-3 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
              >
                ثبت نظر
              </button>
            )}
            {canCancel && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="flex-1 py-3 rounded-xl border border-[#C30000] text-[#C30000] text-sm font-medium hover:bg-[#FBEAEA] transition"
              >
                لغو نوبت
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal لغو */}
      <Modal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="لغو نوبت"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#242424] text-right">
            آیا از لغو این نوبت مطمئن هستید؟
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
