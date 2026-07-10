"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { adminAPI } from "@/lib/api";
import { DataTable } from "@/app/_components/ui/DataTable";
import { Modal } from "@/app/_components/ui/Modal";
import type { Branch, Paginated } from "@/types";

interface BranchForm {
  name: string;
  phone: string;
  address: string;
  city: string;
  is_active: boolean;
}

const emptyForm: BranchForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  is_active: true,
};

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BranchForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchBranches = useCallback(() => {
    setLoading(true);
    adminAPI.branches
      .list(page)
      .then((res) => {
        const paginated = res.data as Paginated<Branch>;
        setBranches(paginated.data);
        setMeta({
          currentPage: paginated.current_page,
          lastPage: paginated.last_page,
          total: paginated.total,
        });
      })
      .catch(() => setError("خطا در دریافت لیست شعبه‌ها"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(branch: Branch) {
    setEditingId(branch.id);
    setForm({
      name: branch.name,
      phone: branch.phone || "",
      address: branch.address || "",
      city: branch.city || "",
      is_active: branch.is_active,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await adminAPI.branches.update(editingId, form);
      } else {
        await adminAPI.branches.create(form);
      }
      setModalOpen(false);
      fetchBranches();
    } catch (err: any) {
      const errors = err?.response?.data?.errors;
      setError(
        errors
          ? Object.values(errors).flat().join(" - ")
          : err?.response?.data?.message || "خطا در ذخیره‌سازی",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(branch: Branch) {
    try {
      await adminAPI.branches.update(branch.id, {
        is_active: !branch.is_active,
      });
      fetchBranches();
    } catch {
      setError("خطا در تغییر وضعیت شعبه");
    }
  }

  const columns = useMemo<ColumnDef<Branch, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "نام شعبه",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "city",
        header: "شهر",
        cell: ({ row }) => row.original.city || "—",
      },
      {
        accessorKey: "address",
        header: "آدرس",
        cell: ({ row }) => (
          <span className="text-[#898989]">{row.original.address || "—"}</span>
        ),
      },
      {
        accessorKey: "phone",
        header: "تلفن",
        cell: ({ row }) => (
          <span dir="ltr" className="text-[#898989]">
            {row.original.phone || "—"}
          </span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "وضعیت",
        cell: ({ row }) => (
          <span
            className={`px-2 py-1 rounded-lg text-xs font-medium ${row.original.is_active ? "bg-[#EAF7EE] text-[#2E7D32]" : "bg-[#F3F3F3] text-[#898989]"}`}
          >
            {row.original.is_active ? "فعال" : "غیرفعال"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "عملیات",
        cell: ({ row }) => (
          <div className="flex gap-3">
            <button
              onClick={() => openEdit(row.original)}
              className="text-xs text-[#A72F3B] hover:underline"
            >
              ویرایش
            </button>
            <button
              onClick={() => handleToggleActive(row.original)}
              className={`text-xs hover:underline ${row.original.is_active ? "text-[#C30000]" : "text-[#2E7D32]"}`}
            >
              {row.original.is_active ? "غیرفعال کن" : "فعال کن"}
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  const inputClass =
    "px-3 py-2 rounded-lg border border-[#EDEDED] text-sm text-right focus:outline-none focus:border-[#A72F3B] w-full";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#242424]">مدیریت شعبه‌ها</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
        >
          + شعبه جدید
        </button>
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
          data={branches}
          emptyMessage="هیچ شعبه‌ای ثبت نشده است."
          pagination={{
            currentPage: meta.currentPage,
            lastPage: meta.lastPage,
            total: meta.total,
            onPageChange: setPage,
          }}
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "ویرایش شعبه" : "شعبه‌ی جدید"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="نام شعبه"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className={inputClass}
          />
          <input
            type="text"
            placeholder="شهر"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="آدرس"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className={inputClass}
          />
          <input
            type="text"
            placeholder="تلفن"
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
          />

          <label className="flex items-center gap-2 justify-end">
            <span className="text-sm text-[#242424]">فعال</span>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="w-4 h-4 accent-[#A72F3B]"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-xl bg-[#A72F3B] text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? "در حال ذخیره..." : "ذخیره"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
