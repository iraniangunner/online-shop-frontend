"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminAPI } from "@/lib/api";

interface Summary {
  total_appointments: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  pending_payment: number;
  no_show: number;
  total_revenue: number;
  total_customers: number;
  total_specialists: number;
  pending_refunds_count: number;
}

interface ChartPoint {
  date: string;
  count?: number;
  amount?: number;
}

interface TopService {
  id: number;
  name: string;
  bookings_count: number;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("fa-IR").format(price) + " تومان";
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fa-IR", {
    day: "numeric",
    month: "short",
  });
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [appointmentsChart, setAppointmentsChart] = useState<ChartPoint[]>([]);
  const [revenueChart, setRevenueChart] = useState<ChartPoint[]>([]);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminAPI
      .dashboard()
      .then((res) => {
        setSummary(res.data.summary);
        setAppointmentsChart(
          res.data.appointments_chart.map((p: ChartPoint) => ({
            ...p,
            label: formatShortDate(p.date),
          }))
        );
        setRevenueChart(
          res.data.revenue_chart.map((p: ChartPoint) => ({
            ...p,
            label: formatShortDate(p.date),
          }))
        );
        setTopServices(res.data.top_services);
      })
      .catch(() => setError("خطا در دریافت آمار داشبورد"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#A72F3B]" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <p className="text-sm text-[#C30000] bg-[#FBEAEA] px-3 py-2 rounded-lg text-right">
        {error || "خطا در دریافت اطلاعات"}
      </p>
    );
  }

  const kpis = [
    {
      label: "کل نوبت‌ها",
      value: summary.total_appointments.toLocaleString("fa-IR"),
    },
    { label: "درآمد کل", value: formatPrice(summary.total_revenue) },
    {
      label: "مشتریان",
      value: summary.total_customers.toLocaleString("fa-IR"),
    },
    {
      label: "متخصص‌های فعال",
      value: summary.total_specialists.toLocaleString("fa-IR"),
    },
  ];

  const statusBreakdown = [
    { label: "تأیید شده", value: summary.confirmed, color: "#0B5CAD" },
    { label: "انجام شده", value: summary.completed, color: "#2E7D32" },
    {
      label: "در انتظار پرداخت",
      value: summary.pending_payment,
      color: "#B8860B",
    },
    { label: "لغو شده", value: summary.cancelled, color: "#C30000" },
    { label: "عدم حضور", value: summary.no_show, color: "#898989" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-[#242424] text-right">
        داشبورد آماری
      </h1>

      {summary.pending_refunds_count > 0 && (
        <div className="bg-[#FFF6E5] border border-[#F5A623]/30 rounded-xl px-4 py-3 text-right">
          <span className="text-sm text-[#B8860B]">
            {summary.pending_refunds_count.toLocaleString("fa-IR")} ریفاند در
            انتظار بررسی دارید.
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-white rounded-2xl border border-[#EDEDED] p-4 text-right space-y-1"
          >
            <p className="text-xs text-[#898989]">{kpi.label}</p>
            <p className="text-xl font-black text-[#A72F3B]">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* وضعیت نوبت‌ها */}
      <div className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3">
        <h2 className="text-sm font-bold text-[#242424] text-right">
          تفکیک وضعیت نوبت‌ها
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statusBreakdown.map((s) => (
            <div key={s.label} className="text-right space-y-1">
              <div className="flex items-center justify-start gap-1.5">
                <span className="text-sm font-bold text-[#242424]">
                  {s.value.toLocaleString("fa-IR")}
                </span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
              </div>
              <p className="text-xs text-[#898989]">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* نمودار نوبت‌های ۳۰ روز اخیر */}
      <div className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3">
        <h2 className="text-sm font-bold text-[#242424] text-right">
          روند نوبت‌ها (۳۰ روز اخیر)
        </h2>
        <div dir="ltr" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={appointmentsChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11 }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                labelFormatter={(v) => formatShortDate(v as string)}
                formatter={(value) => [value, "تعداد نوبت"]}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#A72F3B"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* نمودار درآمد ۳۰ روز اخیر */}
      <div className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3">
        <h2 className="text-sm font-bold text-[#242424] text-right">
          روند درآمد (۳۰ روز اخیر)
        </h2>
        <div dir="ltr" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
              <XAxis
                dataKey="date"
                tickFormatter={formatShortDate}
                tick={{ fontSize: 11 }}
                interval={4}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => `${v / 1_000_000}M`}
              />
              <Tooltip
                labelFormatter={(v) => formatShortDate(v as string)}
                formatter={(value) => [formatPrice(Number(value)), "درآمد"]}
              />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#2E7D32"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* پرفروش‌ترین خدمات */}
      <div className="bg-white rounded-2xl border border-[#EDEDED] p-4 space-y-3">
        <h2 className="text-sm font-bold text-[#242424] text-right">
          پرفروش‌ترین خدمات
        </h2>
        {topServices.length === 0 ? (
          <p className="text-sm text-[#898989] text-center py-6">
            هنوز داده‌ای برای نمایش وجود ندارد.
          </p>
        ) : (
          <div dir="ltr" className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topServices}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#EDEDED" />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  width={140}
                />
                <Tooltip formatter={(value) => [value, "تعداد رزرو"]} />
                <Bar
                  dataKey="bookings_count"
                  fill="#A72F3B"
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
