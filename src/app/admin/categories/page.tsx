"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { adminAPI } from "@/lib/api";
import { DataTable } from "@/app/_components/ui/DataTable";
import { Modal } from "@/app/_components/ui/Modal";
import type { ServiceCategory } from "@/types";

interface CategoryForm {
  name: string;
  sort_order: string;
}

const emptyForm: CategoryForm = { name: "", sort_order: "0" };

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<CategoryForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(() => {
    setLoading(true);
    adminAPI.serviceCategories
      .list()
      .then((res) => setCategories(res.data))
      .catch(() => setError("خطا در دریافت لیست دسته‌بندی‌ها"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(category: ServiceCategory) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      sort_order: String((category as any).sort_order ?? 0),
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = {
      name: form.name,
      sort_order: Number(form.sort_order) || 0,
    };

    try {
      if (editingId) {
        await adminAPI.serviceCategories.update(editingId, payload);
      } else {
        await adminAPI.serviceCategories.create(payload);
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err?.response?.data?.message || "خطا در ذخیره‌ی دسته‌بندی");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("آیا از حذف این دسته‌بندی مطمئن هستید؟")) return;
    try {
      await adminAPI.serviceCategories.delete(id);
      fetchCategories();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "این دسته‌بندی خدمت دارد و قابل حذف نیست.",
      );
    }
  }

  const columns = useMemo<ColumnDef<ServiceCategory, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "نام دسته‌بندی",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: "sort_order",
        header: "ترتیب نمایش",
        cell: ({ row }) => (row.original as any).sort_order ?? 0,
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

  const inputClass =
    "px-3 py-2 rounded-lg border border-[#EDEDED] text-sm text-right focus:outline-none focus:border-[#A72F3B] w-full";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-[#242424]">
          مدیریت دسته‌بندی‌های خدمات
        </h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
        >
          + دسته‌بندی جدید
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
          data={categories}
          emptyMessage="هیچ دسته‌بندی‌ای ثبت نشده است."
        />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "ویرایش دسته‌بندی" : "دسته‌بندی جدید"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="نام دسته‌بندی"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className={inputClass}
          />
          <input
            type="number"
            placeholder="ترتیب نمایش"
            value={form.sort_order}
            onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            className={inputClass}
          />
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
