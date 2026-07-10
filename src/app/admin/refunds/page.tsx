"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { adminAPI } from "@/lib/api";
import { DataTable } from "@/app/_components/ui/DataTable";
import type { Paginated } from "@/types";

interface RefundPayment {
  id: number;
  amount: number;
  ref_id: string | null;
  created_at: string;
  appointment: {
    code: string;
    user?: { name: string; phone: string | null };
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

function formatJalaliDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function AdminRefundsPage() {
  const [payments, setPayments] = useState<RefundPayment[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<number | null>(null);

  const fetchPayments = useCallback(() => {
    setLoading(true);
    adminAPI.payments
      .pendingRefunds(page)
      .then((res) => {
        const paginated = res.data as Paginated<RefundPayment>;
        setPayments(paginated.data);
        setMeta({
          currentPage: paginated.current_page,
          lastPage: paginated.last_page,
          total: paginated.total,
        });
      })
      .catch(() => setError("خطا در دریافت لیست ریفاندها"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  async function handleMarkRefunded(payment: RefundPayment) {
    if (
      !confirm(
        `آیا مبلغ ${formatPrice(payment.amount)} رو از پنل زرین‌پال دستی ریفاند کردی؟ این عملیات فقط برای ثبت وضعیت توی سیستمه.`,
      )
    ) {
      return;
    }

    setProcessingId(payment.id);
    try {
      await adminAPI.payments.markRefunded(payment.id);
      fetchPayments();
    } catch {
      setError("خطا در ثبت ریفاند");
    } finally {
      setProcessingId(null);
    }
  }

  const columns = useMemo<ColumnDef<RefundPayment, any>[]>(
    () => [
      {
        id: "code",
        header: "کد نوبت",
        cell: ({ row }) => (
          <span dir="ltr" className="text-xs text-[#898989]">
            {row.original.appointment?.code}
          </span>
        ),
      },
      {
        id: "customer",
        header: "مشتری",
        cell: ({ row }) => (
          <div>
            <p>{row.original.appointment?.user?.name || "—"}</p>
            {row.original.appointment?.user?.phone && (
              <p dir="ltr" className="text-xs text-[#898989]">
                {row.original.appointment.user.phone}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: "amount",
        header: "مبلغ",
        cell: ({ row }) => (
          <span className="text-[#A72F3B] font-medium">
            {formatPrice(row.original.amount)}
          </span>
        ),
      },
      {
        id: "ref_id",
        header: "کد پیگیری تراکنش",
        cell: ({ row }) => (
          <span dir="ltr" className="text-xs text-[#898989]">
            {row.original.ref_id || "—"}
          </span>
        ),
      },
      {
        id: "created_at",
        header: "تاریخ درخواست",
        cell: ({ row }) => formatJalaliDate(row.original.created_at),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <button
            onClick={() => handleMarkRefunded(row.original)}
            disabled={processingId === row.original.id}
            className="text-xs text-[#2E7D32] hover:underline disabled:opacity-50"
          >
            {processingId === row.original.id
              ? "در حال ثبت..."
              : "علامت‌گذاری به‌عنوان ریفاندشده"}
          </button>
        ),
      },
    ],
    [processingId],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#242424]">
          ریفاندهای در انتظار
        </h1>
        <span className="text-xs text-[#898989]">
          این پرداخت‌ها باید دستی از پنل زرین‌پال ریفاند بشن، بعد اینجا تأیید
          بشن.
        </span>
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
          data={payments}
          emptyMessage="ریفاند در انتظاری وجود ندارد."
          pagination={{
            currentPage: meta.currentPage,
            lastPage: meta.lastPage,
            total: meta.total,
            onPageChange: setPage,
          }}
        />
      )}
    </div>
  );
}
