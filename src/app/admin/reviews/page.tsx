"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { adminAPI } from "@/lib/api";
import { DataTable } from "@/app/_components/ui/DataTable";
import type { Paginated } from "@/types";

interface AdminReview {
  id: number;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at: string;
  user?: { name: string };
  specialist?: { full_name: string };
}

const FILTER_OPTIONS = [
  { value: "", label: "همه" },
  { value: "false", label: "در انتظار تأیید" },
  { value: "true", label: "تأیید شده" },
];

function Stars({ rating }: { rating: number }) {
  return (
    <div dir="ltr" className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={n <= rating ? "text-[#F5A623]" : "text-[#EDEDED]"}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReviews = useCallback(() => {
    setLoading(true);
    adminAPI.reviews
      .list(filter ? { approved: filter === "true" } : undefined)
      .then((res) => {
        const data = res.data as Paginated<AdminReview> | AdminReview[];
        setReviews(Array.isArray(data) ? data : data.data);
      })
      .catch(() => setError("خطا در دریافت لیست نظرات"))
      .finally(() => setLoading(false));
  }, [filter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleApprove(id: number) {
    try {
      await adminAPI.reviews.approve(id);
      fetchReviews();
    } catch {
      setError("خطا در تأیید نظر");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا از حذف این نظر مطمئن هستید؟")) return;
    try {
      await adminAPI.reviews.delete(id);
      fetchReviews();
    } catch {
      setError("خطا در حذف نظر");
    }
  }

  const columns = useMemo<ColumnDef<AdminReview, any>[]>(
    () => [
      {
        id: "user",
        header: "مشتری",
        cell: ({ row }) => row.original.user?.name || "—",
      },
      {
        id: "specialist",
        header: "متخصص",
        cell: ({ row }) => row.original.specialist?.full_name || "—",
      },
      {
        accessorKey: "rating",
        header: "امتیاز",
        cell: ({ row }) => <Stars rating={row.original.rating} />,
      },
      {
        accessorKey: "comment",
        header: "نظر",
        cell: ({ row }) => (
          <span className="text-[#898989] max-w-xs truncate block">
            {row.original.comment || "—"}
          </span>
        ),
      },
      {
        accessorKey: "is_approved",
        header: "وضعیت",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${
              row.original.is_approved
                ? "bg-[#EAF7EE] text-[#2E7D32]"
                : "bg-[#FFF6E5] text-[#B8860B]"
            }`}
          >
            {row.original.is_approved ? "تأیید شده" : "در انتظار تأیید"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex gap-3">
            {!row.original.is_approved && (
              <button
                onClick={() => handleApprove(row.original.id)}
                className="text-xs text-[#2E7D32] hover:underline"
              >
                تأیید
              </button>
            )}
            <button
              onClick={() => handleDelete(row.original.id)}
              className="text-xs text-[#C30000] hover:underline"
            >
              حذف
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#242424]">مدیریت نظرات</h1>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-3 rounded-xl border border-[#EDEDED] text-sm text-right focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10 transition"
        >
          {FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
      ) : (
        <DataTable
          columns={columns}
          data={reviews}
          emptyMessage="نظری ثبت نشده است."
        />
      )}
    </div>
  );
}
