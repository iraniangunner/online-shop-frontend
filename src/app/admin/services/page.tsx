"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { adminAPI, branchesAPI } from "@/lib/api";
import { DataTable } from "@/app/_components/ui/DataTable";
import { Modal } from "@/app/_components/ui/Modal";
import type { Service, ServiceCategory, Branch, Paginated } from "@/types";

interface ServiceForm {
  service_category_id: string;
  name: string;
  description: string;
  duration_minutes: string;
  price: string;
  is_active: boolean;
  branch_ids: number[];
}

const emptyForm: ServiceForm = {
  service_category_id: "",
  name: "",
  description: "",
  duration_minutes: "30",
  price: "",
  is_active: true,
  branch_ids: [],
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchServices = useCallback(() => {
    setLoading(true);
    adminAPI.services
      .list(page)
      .then((res) => {
        const paginated = res.data as Paginated<Service>;
        setServices(paginated.data);
        setMeta({
          currentPage: paginated.current_page,
          lastPage: paginated.last_page,
          total: paginated.total,
        });
      })
      .catch(() => setError("خطا در دریافت لیست خدمات"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  useEffect(() => {
    adminAPI.serviceCategories.list().then((res) => setCategories(res.data));
    branchesAPI.list().then((res) => setBranches(res.data));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function openEdit(service: Service) {
    setEditingId(service.id);
    setModalOpen(true);
    try {
      const res = await adminAPI.services.show(service.id);
      const full = res.data;
      setForm({
        service_category_id: String(full.service_category_id),
        name: full.name,
        description: full.description || "",
        duration_minutes: String(full.duration_minutes),
        price: String(full.price),
        is_active: full.is_active,
        branch_ids: full.branches?.map((b: Branch) => b.id) || [],
      });
    } catch {
      setError("خطا در دریافت جزئیات خدمت");
    }
  }

  function toggleBranch(id: number) {
    setForm((prev) => ({
      ...prev,
      branch_ids: prev.branch_ids.includes(id)
        ? prev.branch_ids.filter((b) => b !== id)
        : [...prev.branch_ids, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (form.branch_ids.length === 0) {
      setError("حداقل یک شعبه را انتخاب کنید.");
      return;
    }

    setSaving(true);
    setError("");

    const payload = {
      service_category_id: Number(form.service_category_id),
      name: form.name,
      description: form.description || undefined,
      duration_minutes: Number(form.duration_minutes),
      price: Number(form.price),
      is_active: form.is_active,
      branch_ids: form.branch_ids,
    };

    try {
      if (editingId) {
        await adminAPI.services.update(editingId, payload);
      } else {
        await adminAPI.services.create(payload);
      }
      setModalOpen(false);
      fetchServices();
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

  async function handleDelete(service: Service) {
    if (!confirm(`آیا از حذف «${service.name}» مطمئن هستید؟`)) return;
    try {
      await adminAPI.services.delete(service.id);
      fetchServices();
    } catch {
      setError("خطا در حذف خدمت");
    }
  }

  const columns = useMemo<ColumnDef<Service, any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "نام خدمت",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        id: "category",
        header: "دسته‌بندی",
        cell: ({ row }) => (
          <span className="text-[#898989]">
            {row.original.category?.name || "—"}
          </span>
        ),
      },
      {
        accessorKey: "duration_minutes",
        header: "مدت‌زمان",
        cell: ({ row }) => `${row.original.duration_minutes} دقیقه`,
      },
      {
        accessorKey: "price",
        header: "قیمت",
        cell: ({ row }) => (
          <span className="text-[#A72F3B] font-medium">
            {formatPrice(row.original.price)}
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
              onClick={() => handleDelete(row.original)}
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
        <h1 className="text-lg font-bold text-[#242424]">مدیریت خدمات</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
        >
          + خدمت جدید
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
          data={services}
          emptyMessage="هیچ خدمتی ثبت نشده است."
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
        title={editingId ? "ویرایش خدمت" : "خدمت جدید"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="نام خدمت"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            className={inputClass}
          />

          <select
            value={form.service_category_id}
            onChange={(e) =>
              setForm({ ...form, service_category_id: e.target.value })
            }
            required
            className={inputClass}
          >
            <option value="">انتخاب دسته‌بندی</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              placeholder="مدت‌زمان (دقیقه)"
              value={form.duration_minutes}
              onChange={(e) =>
                setForm({ ...form, duration_minutes: e.target.value })
              }
              required
              min={5}
              className={inputClass}
            />
            <input
              type="number"
              placeholder="قیمت (تومان)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
              min={0}
              className={inputClass}
            />
          </div>

          <textarea
            placeholder="توضیحات (اختیاری)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className={inputClass}
          />

          <div className="space-y-1.5">
            <p className="text-xs text-[#898989] text-right">
              شعبه‌هایی که این خدمت رو ارائه می‌دن
            </p>
            <div className="flex flex-wrap gap-2">
              {branches.map((branch) => (
                <label
                  key={branch.id}
                  className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition ${
                    form.branch_ids.includes(branch.id)
                      ? "bg-[#FBEAEA] border-[#A72F3B] text-[#A72F3B]"
                      : "bg-white border-[#EDEDED] text-[#898989]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.branch_ids.includes(branch.id)}
                    onChange={() => toggleBranch(branch.id)}
                    className="hidden"
                  />
                  {branch.name}
                </label>
              ))}
            </div>
          </div>

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
