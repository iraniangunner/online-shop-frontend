"use client";

import { useState } from "react";
import { appointmentsAPI } from "@/lib/api";
import { StatusBadge } from "./StatusBadge";
import type { Appointment } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

function formatJalali(dateTimeStr: string) {
  const date = new Date(dateTimeStr);
  const dateLabel = date.toLocaleDateString("fa-IR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const timeLabel = date.toLocaleTimeString("fa-IR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return { dateLabel, timeLabel };
}

export function AppointmentCard({
  appointment,
  onUpdated,
}: {
  appointment: Appointment;
  onUpdated: () => void;
}) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { dateLabel, timeLabel } = formatJalali(appointment.starts_at);
  const isUpcoming = new Date(appointment.starts_at) > new Date();
  const canCancel =
    (appointment.status === "confirmed" ||
      appointment.status === "pending_payment") &&
    isUpcoming;
  const canReview = appointment.status === "completed" && !appointment.review;

  async function handleCancel() {
    setLoading(true);
    setError("");
    try {
      await appointmentsAPI.cancel(appointment.id);
      onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در لغو نوبت.");
    } finally {
      setLoading(false);
      setShowCancelConfirm(false);
    }
  }

  async function handleSubmitReview() {
    setLoading(true);
    setError("");
    try {
      await appointmentsAPI.review(appointment.id, { rating, comment });
      setShowReviewForm(false);
      onUpdated();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در ثبت نظر.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3">
      <div className="flex items-start justify-between">
        <StatusBadge status={appointment.status} />
        <span dir="ltr" className="text-xs text-[#CBCBCB]">
          {appointment.code}
        </span>
      </div>

      <div className="space-y-1 text-right">
        <p className="font-medium text-[#242424]">
          {appointment.services?.map((s) => s.name).join("، ")}
        </p>
        <p className="text-xs text-[#898989]">
          متخصص: {appointment.specialist?.full_name} · شعبه:{" "}
          {appointment.branch?.name}
        </p>
        <p className="text-xs text-[#898989]">
          {dateLabel} — <span dir="ltr">{timeLabel}</span>
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[#EDEDED]">
        <span className="text-sm font-bold text-[#A72F3B]">
          {formatPrice(appointment.total_price)}
        </span>

        <div className="flex gap-2">
          {canCancel && !showCancelConfirm && (
            <button
              onClick={() => setShowCancelConfirm(true)}
              className="text-xs text-[#C30000] hover:underline"
            >
              لغو نوبت
            </button>
          )}
          {canReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="text-xs text-[#A72F3B] hover:underline"
            >
              ثبت نظر
            </button>
          )}
        </div>
      </div>

      {error && (
        <p className="text-xs text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
          {error}
        </p>
      )}

      {appointment.review && (
        <div className="bg-[#F7F7F7] rounded-xl p-3 space-y-1">
          <div dir="ltr" className="flex justify-center gap-0.5">
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
            <p className="text-xs text-[#898989] text-right">
              {appointment.review.comment}
            </p>
          )}
        </div>
      )}

      {showCancelConfirm && (
        <div className="bg-[#FBEAEA]/50 rounded-xl p-3 space-y-2">
          <p className="text-xs text-[#242424] text-right">
            آیا از لغو این نوبت مطمئن هستید؟
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-[#C30000] text-white text-xs font-medium disabled:opacity-50"
            >
              {loading ? "در حال لغو..." : "بله، لغو کن"}
            </button>
            <button
              onClick={() => setShowCancelConfirm(false)}
              disabled={loading}
              className="flex-1 py-2 rounded-lg border border-[#EDEDED] text-[#242424] text-xs font-medium"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

      {showReviewForm && (
        <div className="bg-[#F7F7F7] rounded-xl p-3 space-y-3">
          <div className="flex justify-center gap-1" dir="ltr">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setRating(n)}
                className="text-2xl leading-none transition-transform hover:scale-110"
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
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-[#EDEDED] bg-white text-right text-sm
                       placeholder:text-[#CBCBCB] focus:outline-none focus:border-[#A72F3B] transition"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmitReview}
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-[#A72F3B] text-white text-xs font-medium disabled:opacity-50"
            >
              {loading ? "در حال ثبت..." : "ثبت نظر"}
            </button>
            <button
              onClick={() => setShowReviewForm(false)}
              disabled={loading}
              className="flex-1 py-2 rounded-lg border border-[#EDEDED] text-[#242424] text-xs font-medium"
            >
              انصراف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
