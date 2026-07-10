"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { adminAPI } from "@/lib/api";
import { DataTable } from "@/app/_components/ui/DataTable";
import { Modal } from "@/app/_components/ui/Modal";
import { StatusBadge } from "@/app/_components/dashboard/StatusBadge";
import type { Paginated, Appointment } from "@/types";

interface AdminUser {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
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

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchInput, setSearchInput] = useState(""); // مقداری که کاربر تایپ می‌کنه (فوری)
  const [search, setSearch] = useState(""); // مقدار debounce‌شده (این باعث فچ می‌شه)
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [detailAppointments, setDetailAppointments] = useState<Appointment[]>(
    [],
  );
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminAPI.users
      .list({ search: search || undefined, page })
      .then((res) => {
        const paginated = res.data as Paginated<AdminUser>;
        setUsers(paginated.data);
        setMeta({
          currentPage: paginated.current_page,
          lastPage: paginated.last_page,
          total: paginated.total,
        });
      })
      .catch(() => setError("خطا در دریافت لیست کاربران"))
      .finally(() => setLoading(false));
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // debounce: ۴۰۰ میلی‌ثانیه بعد از آخرین حرفی که تایپ شده، مقدار واقعی
  // جستجو (که فچ رو تریگر می‌کنه) آپدیت می‌شه - نه با هر حرف
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  async function handleToggleActive(user: AdminUser) {
    try {
      await adminAPI.users.toggleActive(user.id);
      fetchUsers();
    } catch {
      setError("خطا در تغییر وضعیت کاربر");
    }
  }

  async function openDetail(user: AdminUser) {
    setDetailUser(user);
    setDetailModalOpen(true);
    setDetailLoading(true);
    try {
      const res = await adminAPI.users.show(user.id);
      setDetailAppointments(res.data.appointments || []);
    } catch {
      setError("خطا در دریافت جزئیات کاربر");
    } finally {
      setDetailLoading(false);
    }
  }

  const columns = useMemo<ColumnDef<AdminUser, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "نام",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "email",
        header: "ایمیل",
        cell: ({ row }) => (
          <span dir="ltr" className="text-[#898989]">
            {row.original.email || "—"}
          </span>
        ),
      },
      {
        accessorKey: "phone",
        header: "موبایل",
        cell: ({ row }) => (
          <span dir="ltr" className="text-[#898989]">
            {row.original.phone || "—"}
          </span>
        ),
      },
      {
        id: "created_at",
        header: "تاریخ عضویت",
        cell: ({ row }) => formatJalaliDate(row.original.created_at),
      },
      {
        accessorKey: "is_active",
        header: "وضعیت",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${row.original.is_active ? "bg-[#EAF7EE] text-[#2E7D32]" : "bg-[#F3F3F3] text-[#898989]"}`}
          >
            {row.original.is_active ? "فعال" : "مسدود"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex gap-3">
            <button
              onClick={() => openDetail(row.original)}
              className="text-xs text-[#A72F3B] hover:underline"
            >
              مشاهده
            </button>
            <button
              onClick={() => handleToggleActive(row.original)}
              className={`text-xs hover:underline ${row.original.is_active ? "text-[#C30000]" : "text-[#2E7D32]"}`}
            >
              {row.original.is_active ? "مسدود کن" : "رفع مسدودیت"}
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-lg font-bold text-[#242424]">مدیریت کاربران</h1>
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="جستجو با نام، ایمیل یا موبایل..."
          className="px-4 py-3 rounded-xl border border-[#EDEDED] text-sm text-right focus:outline-none focus:border-[#A72F3B] focus:ring-4 focus:ring-[#A72F3B]/10 w-64 transition"
        />
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
          data={users}
          emptyMessage="کاربری یافت نشد."
          pagination={{
            currentPage: meta.currentPage,
            lastPage: meta.lastPage,
            total: meta.total,
            onPageChange: setPage,
          }}
        />
      )}

      <Modal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={detailUser?.name || ""}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-right">
              <p className="text-xs text-[#898989]">ایمیل</p>
              <p dir="ltr" className="text-[#242424] text-right">
                {detailUser?.email || "—"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[#898989]">موبایل</p>
              <p dir="ltr" className="text-[#242424] text-right">
                {detailUser?.phone || "—"}
              </p>
            </div>
          </div>

          <div className="border-t border-[#EDEDED] pt-3 space-y-2">
            <p className="text-xs font-semibold text-[#898989] text-right">
              تاریخچه‌ی نوبت‌ها
            </p>

            {detailLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#A72F3B]" />
              </div>
            ) : detailAppointments.length === 0 ? (
              <p className="text-sm text-[#898989] text-center py-6">
                نوبتی ثبت نکرده است.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {detailAppointments.map((a) => (
                  <div
                    key={a.id}
                    className="bg-[#F7F7F7] rounded-lg p-3 flex items-center justify-between"
                  >
                    <StatusBadge status={a.status} />
                    <div className="text-right">
                      <p className="text-sm text-[#242424]">
                        {a.services?.map((s) => s.name).join("، ") || "—"}
                      </p>
                      <p className="text-xs text-[#898989]">
                        {formatPrice(a.total_price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
