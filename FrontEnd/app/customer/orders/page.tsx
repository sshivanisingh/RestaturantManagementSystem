"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import Link from "next/link"
import {
  Search, Package, Truck, Calendar, MapPin, Phone,
  Clock, ArrowRight, ChefHat, CheckCircle2, MapPinned,
  XCircle, CreditCard, Banknote, ShieldCheck, AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { useGetMyOrders } from "@/src/hooks/useUser"

// ─── Types ────────────────────────────────────────────────────────────────────

interface PaymentInfo {
  _id            : string
  method         : "COD" | "RAZORPAY"
  status         : "pending" | "paid" | "failed" | "refunded"
  amount         : number
  currency       : string
  transactionId  : string | null
  gatewayOrderId : string | null
  paidAt         : string | null
  customerEmail  : string
  customerPhone  : string
}

interface OrderItem {
  menuItemId: string
  name      : string
  image     : string
  price     : number
  quantity  : number
}

interface Order {
  _id            : string
  orderId        : string
  // ✅ Fix: API response mein orderstatus aur deliverystatus alag hain
  orderstatus    : string
  deliverystatus : string
  paymentId      : PaymentInfo | null
  items          : OrderItem[]
  deliveryInfo   : {
    name    : string
    phone   : string
    address : string
    city    : string
    pincode : string
    type    : string
  }
  pricing: {
    subtotal      : number
    tax           : number
    deliveryCharge: number
    discount      : number
    total         : number
  }
  statusHistory: { status: string; note: string; timestamp: string; _id: string }[]
  createdAt    : string
  updatedAt    : string
  isGuestOrder : boolean
  couponCode   : string | null
  notes        : string | null
}

// ─── Status config ────────────────────────────────────────────────────────────

// orderstatus config
const ORDER_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending  : { color: "bg-yellow-100 text-yellow-800", label: "Pending"   },
  confirmed: { color: "bg-blue-100 text-blue-800",     label: "Confirmed" },
  cancelled: { color: "bg-red-100 text-red-800",       label: "Cancelled" },
}

// deliverystatus config
const DELIVERY_STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  pending          : { color: "bg-gray-100 text-gray-700",   label: "Not Dispatched"   },
  out_for_delivery : { color: "bg-orange-100 text-orange-700", label: "Out for Delivery" },
  delivered        : { color: "bg-green-100 text-green-700",  label: "Delivered"        },
}

// payment status config
const PAYMENT_STATUS_CONFIG: Record<string, { color: string; label: string; icon: React.ReactNode }> = {
  pending: { color: "bg-yellow-100 text-yellow-700", label: "Payment Pending",  icon: <AlertCircle className="h-3.5 w-3.5" /> },
  paid   : { color: "bg-green-100 text-green-700",   label: "Paid Online",      icon: <ShieldCheck  className="h-3.5 w-3.5" /> },
  failed : { color: "bg-red-100 text-red-700",       label: "Payment Failed",   icon: <XCircle      className="h-3.5 w-3.5" /> },
  refunded:{ color: "bg-blue-100 text-blue-700",     label: "Refunded",         icon: <CreditCard   className="h-3.5 w-3.5" /> },
}

// ✅ Stepper — orderstatus + deliverystatus dono combine karke steps banate hain
const STATUS_STEPS = [
  { key: "order_placed",      label: "Order Placed",      Icon: Package,      match: (o: Order) => true                                          },
  { key: "confirmed",         label: "Confirmed",         Icon: CheckCircle2, match: (o: Order) => ["confirmed"].includes(o.orderstatus)         },
  { key: "out_for_delivery",  label: "Out for Delivery",  Icon: Truck,        match: (o: Order) => o.deliverystatus === "out_for_delivery" || o.deliverystatus === "delivered" },
  { key: "delivered",         label: "Delivered",         Icon: MapPinned,    match: (o: Order) => o.deliverystatus === "delivered"              },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatDate = (d: string) =>
  d ? new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" }) : ""

const formatDateTime = (d: string) =>
  d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : ""

// ✅ Fix: orderstatus + deliverystatus se tab match karo
const matchesTab = (order: Order, tab: string) => {
  const os = order.orderstatus?.toLowerCase()
  const ds = order.deliverystatus?.toLowerCase()
  if (tab === "all")       return true
  if (tab === "active")    return os === "pending" || os === "confirmed"
  if (tab === "delivered") return ds === "delivered"
  if (tab === "cancelled") return os === "cancelled"
  return true
}

// ─── Payment Badge ────────────────────────────────────────────────────────────

function PaymentBadge({ payment }: { payment: PaymentInfo | null }) {
  if (!payment) return null
  const isCOD = payment.method === "COD"
  const cfg   = PAYMENT_STATUS_CONFIG[payment.status] ?? PAYMENT_STATUS_CONFIG.pending

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
      {cfg.icon}
      {isCOD && payment.status === "pending" ? "Pay on Delivery" : cfg.label}
    </span>
  )
}

// ─── Delivery Map ─────────────────────────────────────────────────────────────

function DeliveryMap({ order }: { order: Order }) {
  const mapRef       = useRef<HTMLDivElement>(null)
  const mapInitedRef = useRef(false)

  useEffect(() => {
    if (!mapRef.current || mapInitedRef.current) return
    const lat = 28.9845
    const lng = 77.7064

    import("leaflet").then((L) => {
      if (!mapRef.current || mapInitedRef.current) return
      mapInitedRef.current = true
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl      : "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl    : "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      })
      const map = L.map(mapRef.current!).setView([lat, lng], 14)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(map)
      L.marker([lat, lng])
        .addTo(map)
        .bindPopup(`<b>${order.deliveryInfo.name}</b><br>${order.deliveryInfo.address}, ${order.deliveryInfo.city}`)
        .openPopup()
    })
  }, [order])

  return <div ref={mapRef} style={{ height: "220px", width: "100%" }} className="rounded-xl overflow-hidden border" />
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery]     = useState("")
  const [activeTab, setActiveTab]         = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [sheetOpen, setSheetOpen]         = useState(false)

  // Always refetch when page mounts (catches new orders placed on checkout)
  const { data: ordersResponse, refetch } = useGetMyOrders()
  const rawOrders = (ordersResponse?.data ?? []) as Order[]

  useEffect(() => { refetch() }, [])

  const filteredOrders = rawOrders.filter((order) => {
    const matchesSearch =
      order.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items?.some((item) => item.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch && matchesTab(order, activeTab)
  })

  // ✅ Fix: counts bhi orderstatus se
  const counts = {
    all      : rawOrders.length,
    active   : rawOrders.filter((o) => o.orderstatus === "pending" || o.orderstatus === "confirmed").length,
    delivered: rawOrders.filter((o) => o.deliverystatus === "delivered").length,
    cancelled: rawOrders.filter((o) => o.orderstatus === "cancelled").length,
  }

  const openSheet = (order: Order) => {
    setSelectedOrder(order)
    setSheetOpen(true)
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-pink-50 min-h-full">
          <div className="container mx-auto px-4 py-8">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <h1 className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-2">
                My Orders
              </h1>
              <p className="text-gray-600 mb-6">Track and manage your food orders</p>
            </motion.div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100">
              <div className="p-6">

                {/* ── Tabs + Search ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                    <TabsList className="bg-gray-100 p-1 rounded-full">
                      {(["all", "active", "delivered", "cancelled"] as const).map((tab) => (
                        <TabsTrigger
                          key={tab}
                          value={tab}
                          className="rounded-full data-[state=active]:bg-white data-[state=active]:text-brand-primary text-sm flex items-center gap-1.5"
                        >
                          {tab === "all" ? "All" : tab === "active" ? "Active" : tab === "delivered" ? "Delivered" : "Cancelled"}
                          <span className="text-xs bg-white/60 rounded-full px-1.5 py-0.5 leading-none">
                            {counts[tab]}
                          </span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </Tabs>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search orders..."
                      className="pl-9 border-2 border-gray-200 focus:border-brand-primary"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {/* ── Order Cards ── */}
                {filteredOrders.length > 0 ? (
                  <div className="space-y-6">
                    {filteredOrders.map((order, index) => {
                      // ✅ Fix: orderstatus + deliverystatus alag use karo
                      const orderCfg    = ORDER_STATUS_CONFIG[order.orderstatus]    ?? { color: "bg-gray-100 text-gray-800", label: order.orderstatus }
                      const deliveryCfg = DELIVERY_STATUS_CONFIG[order.deliverystatus] ?? { color: "bg-gray-100 text-gray-700", label: order.deliverystatus }
                      const isOnTheWay  = order.deliverystatus === "out_for_delivery"
                      const isDelivered = order.deliverystatus === "delivered"
                      const payment     = order.paymentId

                      return (
                        <motion.div
                          key={order._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: index * 0.1 }}
                          className="border rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                        >
                          {/* Card Header */}
                          <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <Package className="h-4 w-4 text-brand-primary" />
                                Order #{order.orderId}
                              </div>
                              <div className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {formatDate(order.createdAt)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {/* ✅ orderstatus badge */}
                              <Badge className={orderCfg.color}>{orderCfg.label}</Badge>
                              {/* ✅ deliverystatus badge — sirf tab dikhao jab confirmed ho */}
                              {order.orderstatus === "confirmed" && (
                                <Badge className={deliveryCfg.color}>{deliveryCfg.label}</Badge>
                              )}
                              {/* ✅ payment badge */}
                              <PaymentBadge payment={payment} />
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2 border-gray-200 hover:border-brand-primary"
                                onClick={() => openSheet(order)}
                              >
                                {isOnTheWay ? "Track Order" : "View Details"}
                              </Button>
                            </div>
                          </div>

                          {/* Live tracking banner */}
                          {isOnTheWay && (
                            <div
                              className="bg-orange-50 border-b border-orange-100 px-4 py-2 flex items-center justify-between cursor-pointer"
                              onClick={() => openSheet(order)}
                            >
                              <div className="flex items-center gap-2 text-sm text-orange-700">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
                                </span>
                                Delivery boy is on the way — tap to track live
                              </div>
                              <MapPin className="h-4 w-4 text-orange-500" />
                            </div>
                          )}

                          {/* Items */}
                          <div className="p-4">
                            <div className="mb-4">
                              <div className="font-medium mb-2">Items</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {order.items?.map((item) => (
                                  <div key={item.menuItemId} className="flex items-center gap-3">
                                    <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                      <img
                                        src={item.image || "/placeholder.svg"}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <div className="font-medium text-sm">{item.name}</div>
                                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                                      <div className="text-xs font-medium text-gray-700">₹{item.price}</div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Delivery + Total row */}
                            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t">
                              <div>
                                <div className="font-medium mb-1 flex items-center gap-1.5">
                                  <Truck className="h-4 w-4 text-brand-primary" />
                                  Delivery Information
                                </div>
                                <div className="text-sm text-gray-600 flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {isDelivered
                                    ? `Delivered on ${formatDate(order.updatedAt)}`
                                    : `Ordered on ${formatDate(order.createdAt)}`}
                                </div>
                                <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {order.deliveryInfo?.address
                                    ? `${order.deliveryInfo.address}, ${order.deliveryInfo.city} — ${order.deliveryInfo.pincode}`
                                    : "Pickup order"}
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="font-medium mb-1 text-sm">Order Total</div>
                                <div className="text-xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                                  ₹{order.pricing?.total?.toFixed(2)}
                                </div>
                                {/* COD pending — amount to pay */}
                                {payment?.method === "COD" && payment?.status === "pending" && (
                                  <div className="text-xs text-amber-600 mt-0.5 font-medium">
                                    Pay ₹{order.pricing?.total?.toFixed(2)} on delivery
                                  </div>
                                )}
                                {/* Razorpay paid */}
                                {payment?.status === "paid" && (
                                  <div className="text-xs text-green-600 mt-0.5 font-medium flex items-center justify-end gap-1">
                                    <ShieldCheck className="h-3 w-3" /> Payment done
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-center py-12"
                  >
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                      <Package className="h-10 w-10 text-brand-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-6">
                      {searchQuery ? "Try adjusting your search" : "You haven't placed any orders yet"}
                    </p>
                    <Button
                      className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-white"
                      asChild
                    >
                      <Link href="/">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Browse Menu
                      </Link>
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>

      {/* ══════════════════════════════════════════════════════════════════
          BOTTOM SHEET — Order Detail
      ══════════════════════════════════════════════════════════════════ */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="h-[92vh] overflow-y-auto rounded-t-2xl px-4 pb-10 pt-4">
          {selectedOrder && (() => {
            const payment      = selectedOrder.paymentId
            const orderCfg     = ORDER_STATUS_CONFIG[selectedOrder.orderstatus]    ?? { color: "bg-gray-100 text-gray-800", label: selectedOrder.orderstatus }
            const deliveryCfg  = DELIVERY_STATUS_CONFIG[selectedOrder.deliverystatus] ?? { color: "bg-gray-100 text-gray-700", label: selectedOrder.deliverystatus }
            const payCfg       = PAYMENT_STATUS_CONFIG[payment?.status ?? "pending"] ?? PAYMENT_STATUS_CONFIG.pending
            const isCancelled  = selectedOrder.orderstatus === "cancelled"
            const isOnTheWay   = selectedOrder.deliverystatus === "out_for_delivery"
            const isDelivered  = selectedOrder.deliverystatus === "delivered"

            // ✅ Stepper — current step calculate karo
            const currentStep = STATUS_STEPS.reduce((acc, step, i) => step.match(selectedOrder) ? i : acc, 0)

            return (
              <>
                {/* Sheet handle */}
                <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

                <SheetHeader className="mb-5">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <SheetTitle className="font-satisfy text-2xl bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                        Order #{selectedOrder.orderId}
                      </SheetTitle>
                      <p className="text-sm text-gray-500 mt-0.5">Placed on {formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    {/* ✅ Dono badges — orderstatus + deliverystatus */}
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={`${orderCfg.color} text-sm px-3 py-1`}>{orderCfg.label}</Badge>
                      {selectedOrder.orderstatus === "confirmed" && (
                        <Badge className={`${deliveryCfg.color} text-sm px-3 py-1`}>{deliveryCfg.label}</Badge>
                      )}
                    </div>
                  </div>
                </SheetHeader>

                {/* ── Payment block ── */}
                <div className="rounded-xl border p-4 mb-5 bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Payment</p>
                  <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-2">
                      {payment?.method === "COD"
                        ? <Banknote className="h-5 w-5 text-amber-600" />
                        : <CreditCard className="h-5 w-5 text-blue-600" />}
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {payment?.method === "COD" ? "Cash on Delivery" : "Razorpay (Online)"}
                        </p>
                        <p className="text-xs text-gray-500">₹{payment?.amount?.toFixed(2)} {payment?.currency}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${payCfg.color}`}>
                      {payCfg.icon}
                      {payment?.method === "COD" && payment?.status === "pending" ? "Pay on Delivery" : payCfg.label}
                    </span>
                  </div>

                  {/* Razorpay paid details */}
                  {payment?.method === "RAZORPAY" && payment.status === "paid" && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-1">
                      {payment.transactionId && (
                        <p className="text-xs text-gray-500 flex gap-1">
                          <span className="font-medium text-gray-700 w-28 flex-shrink-0">Payment ID</span>
                          <span className="font-mono truncate">{payment.transactionId}</span>
                        </p>
                      )}
                      {payment.gatewayOrderId && (
                        <p className="text-xs text-gray-500 flex gap-1">
                          <span className="font-medium text-gray-700 w-28 flex-shrink-0">Gateway Order</span>
                          <span className="font-mono truncate">{payment.gatewayOrderId}</span>
                        </p>
                      )}
                      {payment.paidAt && (
                        <p className="text-xs text-gray-500 flex gap-1">
                          <span className="font-medium text-gray-700 w-28 flex-shrink-0">Paid at</span>
                          <span>{formatDateTime(payment.paidAt)}</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* COD — amount reminder */}
                  {payment?.method === "COD" && payment.status === "pending" && (
                    <div className="mt-3 pt-3 border-t border-amber-200">
                      <p className="text-sm text-amber-700 font-medium">
                        Please keep ₹{payment.amount?.toFixed(2)} ready for the delivery boy.
                      </p>
                    </div>
                  )}
                </div>

                {/* ── Live map (out_for_delivery) ── */}
                {isOnTheWay && (
                  <div className="mb-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                      </span>
                      <span className="text-sm font-medium text-orange-700">Live — delivery boy is on the way</span>
                    </div>
                    <DeliveryMap order={selectedOrder} />
                  </div>
                )}

                {/* ── Status Stepper ── */}
                {!isCancelled && (
                  <div className="mb-5">
                    <p className="font-semibold text-gray-800 mb-4">Order Progress</p>
                    <div className="relative">
                      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
                      <div
                        className="absolute left-4 top-4 w-0.5 bg-brand-primary transition-all duration-500"
                        style={{ height: `${(currentStep / (STATUS_STEPS.length - 1)) * 100}%` }}
                      />
                      <div className="space-y-5 relative">
                        {STATUS_STEPS.map((step, i) => {
                          const done    = i <= currentStep
                          const current = i === currentStep
                          // ✅ statusHistory se note aur timestamp dhundo
                          const histEntry = selectedOrder.statusHistory?.find((h) =>
                            step.key === "order_placed" ? h.status === "pending" : h.status === step.key
                          )
                          const { Icon } = step
                          return (
                            <div key={step.key} className="flex items-start gap-4">
                              <div className={`
                                relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 flex-shrink-0
                                ${done ? "border-brand-primary bg-brand-primary text-white" : "border-gray-300 bg-white text-gray-400"}
                                ${current ? "ring-4 ring-orange-100" : ""}
                              `}>
                                <Icon className="h-3.5 w-3.5" />
                              </div>
                              <div className="pt-1">
                                <p className={`text-sm font-medium ${done ? "text-gray-900" : "text-gray-400"}`}>
                                  {step.label}
                                </p>
                                {histEntry && (
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {histEntry.note} · {formatDateTime(histEntry.timestamp)}
                                  </p>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Cancelled banner ── */}
                {isCancelled && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-5 flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-700">Order Cancelled</p>
                      <p className="text-sm text-red-500 mt-0.5">
                        {selectedOrder.statusHistory?.findLast?.((h) => h.status === "cancelled")?.note ?? "This order was cancelled."}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Items ── */}
                <div className="mb-5">
                  <p className="font-semibold text-gray-800 mb-3">Items Ordered</p>
                  <div className="divide-y border rounded-xl overflow-hidden">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.menuItemId} className="flex items-center gap-3 p-3">
                        <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={item.image || "/placeholder.svg"} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="text-sm font-semibold text-gray-800 flex-shrink-0">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Pricing breakdown ── */}
                <div className="mb-5 border rounded-xl p-4">
                  <p className="font-semibold text-gray-800 mb-3">Price Breakdown</p>
                  <div className="space-y-2">
                    {[
                      { label: "Subtotal",       value: `₹${selectedOrder.pricing.subtotal.toFixed(2)}`                                                              },
                      { label: "Tax (5%)",        value: `₹${selectedOrder.pricing.tax.toFixed(2)}`                                                                  },
                      { label: "Delivery charge", value: selectedOrder.pricing.deliveryCharge === 0 ? "FREE 🎉" : `₹${selectedOrder.pricing.deliveryCharge.toFixed(2)}` },
                      ...(selectedOrder.pricing.discount > 0
                        ? [{ label: "Discount", value: `-₹${selectedOrder.pricing.discount.toFixed(2)}` }]
                        : []),
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-sm text-gray-600">
                        <span>{label}</span><span>{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold text-base pt-2 border-t">
                      <span>Total</span>
                      <span className="bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                        ₹{selectedOrder.pricing.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Delivery Details ── */}
                <div className="border rounded-xl p-4 space-y-2">
                  <p className="font-semibold text-gray-800 mb-1">Delivery Details</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Package className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <span className="font-medium text-gray-800">{selectedOrder.deliveryInfo.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <span>{selectedOrder.deliveryInfo.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 text-brand-primary flex-shrink-0 mt-0.5" />
                    <span>
                      {selectedOrder.deliveryInfo.address}, {selectedOrder.deliveryInfo.city} — {selectedOrder.deliveryInfo.pincode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="h-4 w-4 text-brand-primary flex-shrink-0" />
                    <span className="capitalize">{selectedOrder.deliveryInfo.type}</span>
                  </div>
                </div>
              </>
            )
          })()}
        </SheetContent>
      </Sheet>
    </div>
  )
}