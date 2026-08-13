"use client";

import { useState } from "react";
import { useQuery }  from "@tanstack/react-query";
import { Toaster }   from "@/components/ui/toaster";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  getOverviewApi, getRevenueChartApi, getTopItemsApi,
  getOrderStatusApi, getDeliveryStatsApi, getCustomerStatsApi,
} from "@/src/api/dashboard.api";
import { TrendingUp, IndianRupee, ShoppingBag, Users, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Colors ───────────────────────────────────────────────────────────────────
const BRAND  = "hsl(16, 85%, 53%)";
const BLUE   = "hsl(200, 98%, 39%)";
const PIE_COLORS = ["#f97316", "#0ea5e9", "#ef4444"];

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, bg }: {
  icon: any; label: string; value: string | number;
  sub?: string; color: string; bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-5 border border-white`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-poppins text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-satisfy font-bold" style={{ color }}>{value}</p>
          {sub && <p className="text-xs font-poppins text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-50">
        <h2 className="text-base font-satisfy text-[hsl(var(--brand-primary))]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-3 font-poppins text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name === "revenue" ? `₹${p.value?.toLocaleString()}` : p.value} {p.name !== "revenue" ? p.name : ""}
        </p>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
export default function ReportsPage() {
  const [days, setDays] = useState(30);

  const overview   = useQuery({ queryKey: ["reports", "overview"],       queryFn: getOverviewApi,    staleTime: 60000 });
  const revenue    = useQuery({ queryKey: ["reports", "revenue", days],  queryFn: () => getRevenueChartApi(days), staleTime: 60000 });
  const topItems   = useQuery({ queryKey: ["reports", "top-items"],      queryFn: () => getTopItemsApi(8), staleTime: 60000 });
  const orderStatus = useQuery({ queryKey: ["reports", "order-status"],  queryFn: getOrderStatusApi, staleTime: 60000 });
  const delivery   = useQuery({ queryKey: ["reports", "delivery"],       queryFn: getDeliveryStatsApi, staleTime: 60000 });
  const customers  = useQuery({ queryKey: ["reports", "customers"],      queryFn: getCustomerStatsApi, staleTime: 60000 });

  const isLoading  = overview.isLoading || revenue.isLoading;
  const ov         = overview.data?.data;
  const revData    = (revenue.data?.data ?? []).map((d) => ({
    ...d,
    date: new Date(d.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
  }));
  const topData    = topItems.data?.data ?? [];
  const statusData = orderStatus.data?.data ?? [];
  const del        = delivery.data?.data;
  const cust       = customers.data?.data;

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-satisfy text-[hsl(var(--brand-primary))]">Reports & Analytics</h1>
            <p className="text-sm font-poppins text-gray-500 mt-0.5">Business performance overview</p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)}
                className={`h-8 px-3 text-xs font-poppins font-medium rounded-lg transition-all
                  ${days === d
                    ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white"
                    : "bg-white border border-gray-200 text-gray-500 hover:border-orange-300"}`}>
                {d}d
              </button>
            ))}
            <Button variant="outline" size="sm"
              onClick={() => { overview.refetch(); revenue.refetch(); topItems.refetch(); orderStatus.refetch(); }}
              className="h-8 px-3 font-poppins text-xs border-gray-200">
              <RefreshCw className="w-3 h-3 mr-1" /> Refresh
            </Button>
          </div>
        </div>

        {/* ── Overview Stats ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-100 animate-pulse rounded-2xl h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={ShoppingBag}  label="Total Orders"     value={ov?.totalOrders ?? 0}
              sub={`${ov?.pendingOrders ?? 0} pending`}   color={BRAND}  bg="bg-orange-50" />
            <StatCard icon={IndianRupee}  label="Total Revenue"    value={`₹${(ov?.totalRevenue ?? 0).toLocaleString()}`}
              sub={`₹${(ov?.todayRevenue ?? 0).toLocaleString()} today`} color="#10b981" bg="bg-green-50" />
            <StatCard icon={TrendingUp}   label="Confirmed Orders" value={ov?.confirmedOrders ?? 0}
              sub="Successfully delivered"                color={BLUE}   bg="bg-blue-50"  />
            <StatCard icon={Users}        label="Total Customers"  value={cust?.totalCustomers ?? 0}
              sub={`${cust?.activeCustomers ?? 0} active`} color="#8b5cf6" bg="bg-purple-50" />
          </div>
        )}

        {/* ── Revenue Chart ── */}
        <SectionCard title={`Revenue — Last ${days} Days`}>
          {revenue.isLoading ? (
            <div className="h-64 bg-gray-50 animate-pulse rounded-xl" />
          ) : revData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl mb-2">📊</p>
                <p className="font-satisfy text-[hsl(var(--brand-primary))]">No revenue data yet</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={revData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={BRAND} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={BRAND} stopOpacity={0}   />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fontFamily: "Poppins" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fontFamily: "Poppins" }} tickLine={false} axisLine={false}
                  tickFormatter={(v) => `₹${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue"
                  stroke={BRAND} strokeWidth={2.5} fill="url(#revenueGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        {/* ── Top Items + Order Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Top Selling Items */}
          <SectionCard title="Top Selling Items">
            {topItems.isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded-lg" />)}
              </div>
            ) : topData.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-3xl mb-1">🍽️</p>
                <p className="font-satisfy text-[hsl(var(--brand-primary))]">No sales data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topData} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fontFamily: "Poppins" }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="itemName" tick={{ fontSize: 11, fontFamily: "Poppins" }}
                    tickLine={false} axisLine={false} width={90} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantity" name="sold" fill={BRAND} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>

          {/* Order Status */}
          <SectionCard title="Order Status Distribution">
            {orderStatus.isLoading ? (
              <div className="h-52 bg-gray-50 animate-pulse rounded-xl" />
            ) : statusData.every((s) => s.count === 0) ? (
              <div className="py-8 text-center">
                <p className="text-3xl mb-1">📦</p>
                <p className="font-satisfy text-[hsl(var(--brand-primary))]">No orders yet</p>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={statusData} dataKey="count" nameKey="status"
                      cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {statusData.map((_: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [val, String(name).charAt(0).toUpperCase() + String(name).slice(1)]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-3">
                  {statusData.map((s: any, i: number) => (
                    <div key={s.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-xs font-poppins capitalize text-gray-600">{s.status}</span>
                      </div>
                      <span className="text-sm font-poppins font-semibold text-[hsl(var(--brand-dark))]">{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── Delivery + Customers ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Delivery Stats */}
          <SectionCard title="Delivery Performance">
            {delivery.isLoading ? (
              <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />)}</div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Total Deliveries",  value: del?.totalDeliveries ?? 0,  color: BLUE,     bg: "bg-blue-50"   },
                  { label: "Delivered",          value: del?.deliveredCount ?? 0,   color: "#10b981", bg: "bg-green-50" },
                  { label: "In Progress",        value: del?.pendingDeliveries ?? 0, color: BRAND,   bg: "bg-orange-50" },
                  { label: "Delivery Rate",      value: `${del?.deliveryRate ?? 0}%`, color: "#8b5cf6", bg: "bg-purple-50" },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl px-4 py-3 flex items-center justify-between`}>
                    <span className="text-sm font-poppins text-gray-600">{label}</span>
                    <span className="text-sm font-poppins font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          {/* Customer Stats */}
          <SectionCard title="Customer Overview">
            {customers.isLoading ? (
              <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 animate-pulse rounded-lg" />)}</div>
            ) : (
              <div className="space-y-4">
                {[
                  { label: "Total Customers",    value: cust?.totalCustomers ?? 0,   color: "#8b5cf6", bg: "bg-purple-50" },
                  { label: "Active Customers",   value: cust?.activeCustomers ?? 0,  color: "#10b981", bg: "bg-green-50"  },
                  { label: "Inactive Customers", value: cust?.inactiveCustomers ?? 0, color: "#94a3b8", bg: "bg-gray-100"  },
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className={`${bg} rounded-xl px-4 py-3 flex items-center justify-between`}>
                    <span className="text-sm font-poppins text-gray-600">{label}</span>
                    <span className="text-sm font-poppins font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
                <div className="mt-2 bg-gray-50 rounded-xl px-4 py-3">
                  <div className="flex justify-between text-xs font-poppins text-gray-500 mb-2">
                    <span>Active rate</span>
                    <span>{cust?.totalCustomers
                      ? Math.round(((cust.activeCustomers) / cust.totalCustomers) * 100)
                      : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-all"
                      style={{ width: `${cust?.totalCustomers
                        ? Math.round((cust.activeCustomers / cust.totalCustomers) * 100)
                        : 0}%` }} />
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
