"use client"

import { MenuProvider } from "@/components/providers/menu-provider"
import { Toaster }      from "@/components/ui/toaster"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  TrendingUp, IndianRupee, ShoppingBag,
  Users, Truck, Clock, CheckCircle2, XCircle,
} from "lucide-react"
import { useGetAllOrders } from "@/src/hooks/useorder"
import {
  useGetDashboardStats,
  useGetRevenueChart,
  useGetTopSellingItems,
  useGetOrderStatusChart,
} from "@/src/hooks/useDashboard"
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { useEffect, useState, useMemo } from "react"

ChartJS.register(
  CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement,
  Title, Tooltip, Legend
)

// ─── Types ────────────────────────────────────────────────────────────────────
interface Order {
  _id         : string
  orderId     : string
  userId?     : { _id: string; name: string; email: string } | null
  paymentId?  : { amount: number; method: string; status: string } | null
  items       : { name: string; price: number; quantity: number }[]
  pricing     : { subtotal: number; tax: number; deliveryCharge: number; discount: number; total: number }
  deliveryInfo: { name: string; phone: string; city: string }
  orderstatus : string
  deliverystatus: string
  isGuestOrder: boolean
  createdAt   : string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n)

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })

const STATUS_STYLES: Record<string, string> = {
  pending         : "bg-amber-100  text-amber-700",
  confirmed       : "bg-blue-100   text-blue-700",
  assigned        : "bg-purple-100 text-purple-700",
  out_for_delivery: "bg-orange-100 text-orange-700",
  delivered       : "bg-green-100  text-green-700",
  cancelled       : "bg-red-100    text-red-600",
}

// ─── Shimmer ──────────────────────────────────────────────────────────────────
function Shimmer({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-100 rounded ${className}`}>
      <div
        className="absolute inset-0 -translate-x-full"
        style={{
          background: "linear-gradient(90deg,transparent 0%,rgba(255,255,255,.6) 50%,transparent 100%)",
          animation : "shimmer 1.5s infinite",
        }}
      />
      <style>{`@keyframes shimmer{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}`}</style>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, iconBg }: {
  label: string; value: string; sub: string
  icon: React.ReactNode; iconBg: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-poppins text-gray-500">{label}</p>
            <h3 className="text-2xl font-bold font-poppins mt-1">{value}</h3>
            <p className="text-xs font-poppins text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" />{sub}
            </p>
          </div>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ═════════════════════════════════════════════════════════════════════════════
export default function AdminDashboardPage() {
  const [isClient, setIsClient] = useState(false)
  const [revenueType, setRevenueType] = useState<"7days" | "30days">("7days")
  useEffect(() => setIsClient(true), [])

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useGetAllOrders()
  const { data: dashboardStatsData } = useGetDashboardStats()
  const { data: revenueData } = useGetRevenueChart(revenueType === "7days" ? 7 : 30)
  const { data: topItemsData } = useGetTopSellingItems(5)
  const { data: orderStatusData } = useGetOrderStatusChart()

  const orders: Order[] = data?.data?.orders ?? []

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalRevenue    = orders
      .filter(o => o.paymentId?.status === "paid")
      .reduce((s, o) => s + (o.pricing?.total ?? 0), 0)
    const totalOrders     = orders.length
    const paidOrders      = orders.filter(o => o.paymentId?.status === "paid").length
    const deliveredOrders = orders.filter(o => o.deliverystatus === "delivered").length
    const pendingOrders   = orders.filter(o => o.deliverystatus === "pending").length
    const cancelledOrders = orders.filter(o => o.orderstatus   === "cancelled").length
    const ongoingOrders   = orders.filter(o =>
      ["assigned", "out_for_delivery"].includes(o.deliverystatus)
    ).length
    const guestOrders     = orders.filter(o => o.isGuestOrder).length
    const uniqueCustomers = new Set(
      orders.filter(o => o.userId).map(o => o.userId?._id)
    ).size

    return {
      totalRevenue, totalOrders, paidOrders, deliveredOrders,
      pendingOrders, cancelledOrders, ongoingOrders,
      guestOrders, uniqueCustomers,
    }
  }, [orders])

  // ── Revenue by date ─────────────────────────────────────────────────────────
  const revenueChart = useMemo(() => {
    const map: Record<string, number> = {}
    orders
      .filter(o => o.paymentId?.status === "paid")
      .forEach(o => {
        const key = new Date(o.createdAt)
          .toLocaleDateString("en-IN", { day: "numeric", month: "short" })
        map[key] = (map[key] ?? 0) + (o.pricing?.total ?? 0)
      })
    const entries = Object.entries(map).slice(-7)
    return { labels: entries.map(([k]) => k), values: entries.map(([, v]) => v) }
  }, [orders])

  // ── Payment method breakdown ────────────────────────────────────────────────
  const paymentChart = useMemo(() => {
    const map: Record<string, number> = {}
    orders.forEach(o => {
      const m = o.paymentId?.method ?? "Unpaid"
      map[m]  = (map[m] ?? 0) + 1
    })
    return { labels: Object.keys(map), values: Object.values(map) }
  }, [orders])

  // ── Delivery status doughnut ────────────────────────────────────────────────
  const statusChart = useMemo(() => ({
    labels: ["Pending", "Ongoing", "Delivered", "Cancelled"],
    values: [stats.pendingOrders, stats.ongoingOrders, stats.deliveredOrders, stats.cancelledOrders],
  }), [stats])

  // ── Recent 5 orders ─────────────────────────────────────────────────────────
  const recentOrders = useMemo(() =>
    [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [orders]
  )

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MenuProvider>
      <div className="container mx-auto px-4 py-8 space-y-8">

              <h1 className="text-3xl font-satisfy text-brand-primary">Admin Dashboard</h1>

              {/* Error banner */}
              {isError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded text-sm font-poppins text-red-600">
                  Failed to load orders. Please refresh the page.
                </div>
              )}

              {/* ── Stat Cards ──────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                  [...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6 space-y-3">
                        <Shimmer className="h-3 w-28" />
                        <Shimmer className="h-7 w-24" />
                        <Shimmer className="h-3 w-32" />
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <>
                    <StatCard
                      label="Total Revenue"
                      value={fmtINR(stats.totalRevenue)}
                      sub={`${stats.paidOrders} paid orders`}
                      icon={<IndianRupee className="w-6 h-6 text-brand-primary" />}
                      iconBg="bg-brand-primary/10"
                    />
                    <StatCard
                      label="Total Orders"
                      value={String(stats.totalOrders)}
                      sub={`${stats.deliveredOrders} delivered`}
                      icon={<ShoppingBag className="w-6 h-6 text-brand-secondary" />}
                      iconBg="bg-brand-secondary/10"
                    />
                    <StatCard
                      label="Active Deliveries"
                      value={String(stats.ongoingOrders)}
                      sub={`${stats.pendingOrders} pending`}
                      icon={<Truck className="w-6 h-6 text-brand-accent" />}
                      iconBg="bg-brand-accent/10"
                    />
                    <StatCard
                      label="Unique Customers"
                      value={String(stats.uniqueCustomers)}
                      sub={`${stats.guestOrders} guest orders`}
                      icon={<Users className="w-6 h-6 text-purple-600" />}
                      iconBg="bg-purple-100"
                    />
                  </>
                )}
              </div>

              {/* ── Quick Status Pills ──────────────────────────────────────── */}
              {!isLoading && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Pending",    count: stats.pendingOrders,   icon: <Clock        className="w-4 h-4" />, color: "amber"  },
                    { label: "On the Way", count: stats.ongoingOrders,   icon: <Truck        className="w-4 h-4" />, color: "orange" },
                    { label: "Delivered",  count: stats.deliveredOrders, icon: <CheckCircle2 className="w-4 h-4" />, color: "green"  },
                    { label: "Cancelled",  count: stats.cancelledOrders, icon: <XCircle      className="w-4 h-4" />, color: "red"    },
                  ].map(s => (
                    <div key={s.label}
                      className={`flex items-center gap-3 p-4 rounded-xl border
                        bg-${s.color}-50 border-${s.color}-100`}>
                      <span className={`text-${s.color}-600`}>{s.icon}</span>
                      <div>
                        <p className={`text-xl font-bold font-poppins text-${s.color}-700`}>{s.count}</p>
                        <p className="text-xs font-poppins text-gray-500">{s.label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ── Charts Row 1 ────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="font-poppins text-base">Revenue Over Time</CardTitle>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setRevenueType("7days")}
                        className={`px-3 py-1 text-xs rounded ${
                          revenueType === "7days"
                            ? "bg-brand-primary text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        7 Days
                      </button>
                      <button
                        onClick={() => setRevenueType("30days")}
                        className={`px-3 py-1 text-xs rounded ${
                          revenueType === "30days"
                            ? "bg-brand-primary text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        30 Days
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Shimmer className="h-64 w-full" />
                    ) : isClient && revenueChart.labels.length > 0 ? (
                      <div style={{ height: 260 }}>
                        <Line
                          options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                          data={{
                            labels  : revenueChart.labels,
                            datasets: [{
                              label               : "Revenue (₹)",
                              data                : revenueChart.values,
                              borderColor         : "hsl(16,85%,53%)",
                              backgroundColor     : "hsla(16,85%,53%,0.08)",
                              fill                : true,
                              tension             : 0.4,
                              pointBackgroundColor: "hsl(16,85%,53%)",
                            }],
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-sm font-poppins text-gray-400">
                        No paid orders yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-poppins text-base">Orders by Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <Shimmer className="h-64 w-full" />
                    ) : isClient && paymentChart.labels.length > 0 ? (
                      <div style={{ height: 260 }}>
                        <Bar
                          options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }}
                          data={{
                            labels  : paymentChart.labels,
                            datasets: [{
                              label          : "Orders",
                              data           : paymentChart.values,
                              backgroundColor: [
                                "hsl(16,85%,53%)",
                                "hsl(200,98%,39%)",
                                "hsl(43,96%,56%)",
                                "hsl(280,85%,60%)",
                              ],
                              borderRadius: 6,
                            }],
                          }}
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-sm font-poppins text-gray-400">
                        No data
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* ── Charts Row 2 + Recent Orders ────────────────────────────── */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <Card>
                  <CardHeader>
                    <CardTitle className="font-poppins text-base">Delivery Status</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    {isLoading ? (
                      <Shimmer className="w-52 h-52 rounded-full" />
                    ) : isClient ? (
                      <div style={{ height: 240, width: 240 }}>
                        <Doughnut
                          data={{
                            labels  : statusChart.labels,
                            datasets: [{
                              data           : statusChart.values,
                              backgroundColor: [
                                "hsl(43,96%,56%)",
                                "hsl(16,85%,53%)",
                                "hsl(120,70%,45%)",
                                "hsl(0,84%,60%)",
                              ],
                              borderWidth: 2,
                            }],
                          }}
                          options={{
                            maintainAspectRatio: false,
                            plugins: { legend: { position: "bottom", labels: { font: { size: 11 } } } },
                          }}
                        />
                      </div>
                    ) : null}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="font-poppins text-base">Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {isLoading ? (
                      <div className="p-6 space-y-3">
                        {[...Array(5)].map((_, i) => (
                          <div key={i} className="flex gap-4 items-center">
                            <Shimmer className="h-3 w-24" />
                            <Shimmer className="h-3 w-28" />
                            <Shimmer className="h-3 w-20" />
                            <Shimmer className="h-3 w-16 ml-auto" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm font-poppins">
                          <thead>
                            <tr className="border-b bg-gray-50">
                              {["Order", "Customer", "Date", "Amount", "Status"].map(h => (
                                <th key={h}
                                  className="text-left py-3 px-4 text-xs text-gray-500
                                    font-semibold uppercase tracking-wide whitespace-nowrap">
                                  {h}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {recentOrders.length === 0 ? (
                              <tr>
                                <td colSpan={5}
                                  className="py-10 text-center text-gray-400 text-sm font-poppins">
                                  No orders yet
                                </td>
                              </tr>
                            ) : recentOrders.map((order, idx) => {
                              // Real customer name from API
                              const customerName =
                                order.userId?.name ??
                                order.deliveryInfo?.name ??
                                "Guest"

                              // Accurate status from deliverystatus + orderstatus
                              const displayStatus =
                                order.orderstatus    === "cancelled"        ? "cancelled"          :
                                order.deliverystatus === "delivered"        ? "delivered"          :
                                order.deliverystatus === "out_for_delivery" ? "out_for_delivery"   :
                                order.deliverystatus === "assigned"         ? "assigned"           :
                                "pending"

                              return (
                                <tr key={order._id ?? idx}
                                  className="border-b hover:bg-gray-50 transition-colors">
                                  <td className="py-3 px-4 font-medium text-gray-800 whitespace-nowrap">
                                    {order.orderId}
                                  </td>
                                  <td className="py-3 px-4 text-gray-600 max-w-[130px] truncate">
                                    {customerName}
                                    {order.isGuestOrder && (
                                      <span className="ml-1.5 text-[10px] bg-gray-100 text-gray-500
                                        px-1.5 py-0.5 rounded-full">
                                        Guest
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                                    {fmtDate(order.createdAt)}
                                  </td>
                                  <td className="py-3 px-4 font-semibold text-gray-800 whitespace-nowrap">
                                    ₹{order.pricing?.total?.toLocaleString("en-IN") ?? "—"}
                                  </td>
                                  <td className="py-3 px-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                                      capitalize whitespace-nowrap
                                      ${STATUS_STYLES[displayStatus] ?? "bg-gray-100 text-gray-600"}`}>
                                      {displayStatus.replace(/_/g, " ")}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* ── Top Selling Items ──────────────────────────────────────── */}
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins text-base">Top Selling Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-3">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4 items-center">
                          <Shimmer className="h-3 w-24" />
                          <Shimmer className="h-3 w-16 ml-auto" />
                          <Shimmer className="h-3 w-20" />
                        </div>
                      ))}
                    </div>
                  ) : topItemsData?.data && topItemsData.data.length > 0 ? (
                    <div className="space-y-3">
                      {topItemsData.data.map((item: any, idx: number) => (
                        <div key={item._id ?? idx} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-brand-primary w-6 text-center">
                              {idx + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-xs text-gray-500">{item.totalSold} sold</p>
                            </div>
                          </div>
                          <p className="font-semibold text-gray-800">
                            ₹{item.revenue?.toLocaleString("en-IN")}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm">
                      No sales data available
                    </div>
                  )}
                </CardContent>
              </Card>
      </div>
      <Toaster />
    </MenuProvider>
  )
}