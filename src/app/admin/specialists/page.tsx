"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { adminAPI, branchesAPI, servicesAPI } from "@/lib/api";
import { DataTable } from "@/app/_components/ui/DataTable";
import { Modal } from "@/app/_components/ui/Modal";
import type { Specialist, Branch, Service, Paginated } from "@/types";

interface SpecialistForm {
  full_name: string;
  phone: string;
  bio: string;
  is_active: boolean;
  branch_ids: number[];
  service_ids: number[];
  create_account: boolean;
  email: string;
  password: string;
}

const emptyForm: SpecialistForm = {
  full_name: "",
  phone: "",
  bio: "",
  is_active: true,
  branch_ids: [],
  service_ids: [],
  create_account: false,
  email: "",
  password: "",
};

export default function AdminSpecialistsPage() {
  const [specialists, setSpecialists] = useState<Specialist[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ currentPage: 1, lastPage: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<SpecialistForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchSpecialists = useCallback(() => {
    setLoading(true);
    adminAPI.specialists
      .list(page)
      .then((res) => {
        const paginated = res.data as Paginated<Specialist>;
        setSpecialists(paginated.data);
        setMeta({
          currentPage: paginated.current_page,
          lastPage: paginated.last_page,
          total: paginated.total,
        });
      })
      .catch(() => setError("خطا در دریافت لیست متخصص‌ها"))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  useEffect(() => {
    branchesAPI.list().then((res) => setBranches(res.data));
    servicesAPI.list().then((res) => setServices(res.data));
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function openEdit(specialist: Specialist) {
    setEditingId(specialist.id);
    setModalOpen(true);
    try {
      const res = await adminAPI.specialists.show(specialist.id);
      const full = res.data;
      setForm({
        full_name: full.full_name,
        phone: full.phone || "",
        bio: full.bio || "",
        is_active: full.is_active,
        branch_ids: full.branches?.map((b: Branch) => b.id) || [],
        service_ids: full.services?.map((s: Service) => s.id) || [],
        create_account: false,
        email: "",
        password: "",
      });
    } catch {
      setError("خطا در دریافت جزئیات متخصص");
    }
  }

  function toggleInArray(field: "branch_ids" | "service_ids", id: number) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(id)
        ? prev[field].filter((x) => x !== id)
        : [...prev[field], id],
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

    try {
      if (editingId) {
        await adminAPI.specialists.update(editingId, {
          full_name: form.full_name,
          phone: form.phone || undefined,
          bio: form.bio || undefined,
          is_active: form.is_active,
          branch_ids: form.branch_ids,
          service_ids: form.service_ids,
        });
      } else {
        await adminAPI.specialists.create({
          full_name: form.full_name,
          phone: form.phone || undefined,
          bio: form.bio || undefined,
          branch_ids: form.branch_ids,
          service_ids: form.service_ids,
          create_account: form.create_account,
          email: form.create_account ? form.email : undefined,
          password: form.create_account ? form.password : undefined,
        });
      }
      setModalOpen(false);
      fetchSpecialists();
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

  async function handleDelete(specialist: Specialist) {
    if (!confirm(`آیا از حذف «${specialist.full_name}» مطمئن هستید؟`)) return;
    try {
      await adminAPI.specialists.delete(specialist.id);
      fetchSpecialists();
    } catch {
      setError("خطا در حذف متخصص");
    }
  }

  const columns = useMemo<ColumnDef<Specialist, any>[]>(
    () => [
      {
        accessorKey: "full_name",
        header: "نام متخصص",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.full_name}</span>
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
        id: "branches",
        header: "شعبه‌ها",
        cell: ({ row }) =>
          (row.original as any).branches
            ?.map((b: Branch) => b.name)
            .join("، ") || "—",
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
        <h1 className="text-lg font-bold text-[#242424]">مدیریت متخصص‌ها</h1>
        <button
          onClick={openCreate}
          className="px-4 py-2 rounded-xl bg-[#A72F3B] text-white text-sm font-medium hover:bg-[#8f2731] transition"
        >
          + متخصص جدید
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
          data={specialists}
          emptyMessage="هیچ متخصصی ثبت نشده است."
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
        title={editingId ? "ویرایش متخصص" : "متخصص جدید"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="نام و نام خانوادگی"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
            className={inputClass}
          />
          <input
            type="text"
            placeholder="شماره موبایل"
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
          />
          <textarea
            placeholder="بیوگرافی (اختیاری)"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={2}
            className={inputClass}
          />

          <div className="space-y-1.5">
            <p className="text-xs text-[#898989] text-right">شعبه‌ها</p>
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
                    onChange={() => toggleInArray("branch_ids", branch.id)}
                    className="hidden"
                  />
                  {branch.name}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-[#898989] text-right">
              خدماتی که ارائه می‌دهد
            </p>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {services.map((service) => (
                <label
                  key={service.id}
                  className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer border transition ${
                    form.service_ids.includes(service.id)
                      ? "bg-[#FBEAEA] border-[#A72F3B] text-[#A72F3B]"
                      : "bg-white border-[#EDEDED] text-[#898989]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={form.service_ids.includes(service.id)}
                    onChange={() => toggleInArray("service_ids", service.id)}
                    className="hidden"
                  />
                  {service.name}
                </label>
              ))}
            </div>
          </div>

          {editingId && (
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
          )}

          {!editingId && (
            <div className="border-t border-[#EDEDED] pt-3 space-y-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.create_account}
                  onChange={(e) =>
                    setForm({ ...form, create_account: e.target.checked })
                  }
                  className="w-4 h-4 accent-[#A72F3B]"
                />
                <span className="text-sm text-[#242424]">
                  ساخت حساب کاربری برای ورود به پنل متخصص
                </span>
              </label>

              {form.create_account && (
                <>
                  <input
                    type="email"
                    placeholder="ایمیل"
                    dir="ltr"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required={form.create_account}
                    className={inputClass}
                  />
                  <input
                    type="password"
                    placeholder="رمز عبور"
                    dir="ltr"
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    required={form.create_account}
                    className={inputClass}
                  />
                </>
              )}
            </div>
          )}

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
