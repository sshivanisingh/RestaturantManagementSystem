"use client"
import { MenuProvider } from "@/components/providers/menu-provider"
import { Toaster } from "@/components/ui/toaster"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, Search, RefreshCw } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getAllOrdersApi } from "@/src/api/order.api"

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID!

export default function AdminOrdersPage() {
  const [ordersData, setOrdersData]       = useState<any[]>([])
  const [loading, setLoading]             = useState(true)
  const [searchQuery, setSearchQuery]     = useState("")
  const [statusFilter, setStatusFilter]   = useState("all")
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen]   = useState(false)
  const { toast } = useToast()

  // ── Fetch all orders from API ──────────────────────────────────────────────
  const fetchOrders = async () => {
    setLoading(true)
    try {
      const res = await getAllOrdersApi()
      setOrdersData(res.data?.orders || [])
    } catch (err) {
      console.error("Failed to fetch orders:", err)
      toast({
        title      : "Error",
        description: "Failed to load orders. Please try again.",
        variant    : "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // ── Map API fields to display shape ───────────────────────────────────────
  // API returns: orderId, userId, deliveryInfo, pricing, items, orderstatus,
  //              deliverystatus, paymentId, createdAt
  const normalizeOrder = (o: any) => ({
    id      : o.orderId || o._id,
    _id     : o._id,
    customer: o.userId?.name   || o.deliveryInfo?.name  || "Guest",
    email   : o.userId?.email  || o.deliveryInfo?.email || "—",
    date    : new Date(o.createdAt).toLocaleDateString("en-IN", {
                month: "short", day: "numeric", year: "numeric",
              }),
    total   : o.pricing?.total ?? 0,
    status  : o.orderstatus,          // "pending" | "confirmed" | "cancelled" etc.
    items   : o.items || [],
    address : [
                o.deliveryInfo?.address,
                o.deliveryInfo?.city,
                o.deliveryInfo?.pincode,
              ].filter(Boolean).join(", "),
    payment : o.paymentId
                ? `${o.paymentId.method}${o.paymentId.transactionId ? ` (${o.paymentId.transactionId})` : ""}`
                : "—",
    pricing : o.pricing,
    phone   : o.deliveryInfo?.phone || o.userId?.phone || "—",
    deliverystatus: o.deliverystatus,
    statusHistory : o.statusHistory || [],
    raw     : o,
  })

  const normalized = ordersData.map(normalizeOrder)

  // ── Client-side filter (search + status) ──────────────────────────────────
  const filteredOrders = normalized.filter(order => {
    const q = searchQuery.toLowerCase()
    const matchesSearch =
      order.id.toLowerCase().includes(q)       ||
      order.customer.toLowerCase().includes(q) ||
      order.email.toLowerCase().includes(q)
    if (statusFilter === "all") return matchesSearch
    return matchesSearch && order.status.toLowerCase() === statusFilter.toLowerCase()
  })

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setIsDialogOpen(true)
  }

  // ── Status badge — handles API statuses ───────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Confirmed</Badge>
      case "delivered":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Delivered</Badge>
      case "pending":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Pending</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status || "—"}</Badge>
    }
  }

  // ── Local status update (optimistic, no dedicated API yet) ────────────────
  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedOrder) return
    setOrdersData(prev =>
      prev.map(o =>
        (o.orderId === selectedOrder.id || o._id === selectedOrder._id)
          ? { ...o, orderstatus: newStatus }
          : o
      )
    )
    setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }))
    toast({
      title      : "Order status updated",
      description: `Order #${selectedOrder.id} status changed to ${newStatus}`,
    })
    setIsDialogOpen(false)
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <MenuProvider>
      <div className="container mx-auto px-4 py-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-satisfy text-brand-primary">Order Management</h1>
                <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  {/* ── Filters ── */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div className="relative w-full sm:w-64">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search orders..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-40">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* ── Table ── */}
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Order ID</TableHead>
                          <TableHead>Customer</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          /* Loading skeleton rows */
                          Array.from({ length: 5 }).map((_, i) => (
                            <TableRow key={i}>
                              {Array.from({ length: 6 }).map((_, j) => (
                                <TableCell key={j}>
                                  <div className="h-4 bg-gray-100 rounded animate-pulse" />
                                </TableCell>
                              ))}
                            </TableRow>
                          ))
                        ) : filteredOrders.length > 0 ? (
                          filteredOrders.map(order => (
                            <TableRow key={order._id}>
                              <TableCell className="font-medium">#{order.id}</TableCell>
                              <TableCell>
                                <div>
                                  <div>{order.customer}</div>
                                  <div className="text-sm text-gray-500">{order.email}</div>
                                </div>
                              </TableCell>
                              <TableCell>{order.date}</TableCell>
                              <TableCell>₹{order.total.toFixed(2)}</TableCell>
                              <TableCell>{getStatusBadge(order.status)}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="outline" size="sm" onClick={() => handleViewOrder(order)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8">
                              <div className="text-gray-500">
                                <div className="text-5xl mb-4">🔍</div>
                                <h3 className="text-xl font-medium mb-2">No orders found</h3>
                                <p>Try adjusting your search or filter</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
      </div>

      {/* ── Order Details Dialog (UI same as before) ── */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Customer info */}
                <div>
                  <h3 className="font-medium mb-2">Customer Information</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Name:</span> {selectedOrder.customer}</p>
                    <p><span className="font-medium">Email:</span> {selectedOrder.email}</p>
                    <p><span className="font-medium">Phone:</span> {selectedOrder.phone}</p>
                  </div>
                </div>

                {/* Order info */}
                <div>
                  <h3 className="font-medium mb-2">Order Information</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-medium">Date:</span> {selectedOrder.date}</p>
                    <p className="flex items-center gap-1">
                      <span className="font-medium">Status:</span>
                      {getStatusBadge(selectedOrder.status)}
                    </p>
                    <p><span className="font-medium">Delivery:</span> {getStatusBadge(selectedOrder.deliverystatus)}</p>
                    <p><span className="font-medium">Payment:</span> {selectedOrder.payment}</p>
                  </div>
                </div>

                {/* Shipping address */}
                <div>
                  <h3 className="font-medium mb-2">Shipping Address</h3>
                  <p className="text-sm">{selectedOrder.address || "—"}</p>
                </div>
              </div>

              {/* Items table */}
              <div>
                <h3 className="font-medium mb-2">Order Items</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedOrder.items.map((item: any, idx: number) => (
                        <TableRow key={idx}>
                          <TableCell className="flex items-center gap-2">
                            {item.image && (
                              <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                            )}
                            {item.name}
                          </TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">₹{(item.price * item.quantity).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}

                      {/* Pricing breakdown from API */}
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                        <TableCell className="text-right">₹{selectedOrder.pricing?.subtotal?.toFixed(2) ?? "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Tax</TableCell>
                        <TableCell className="text-right">₹{selectedOrder.pricing?.tax?.toFixed(2) ?? "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Delivery</TableCell>
                        <TableCell className="text-right">₹{selectedOrder.pricing?.deliveryCharge?.toFixed(2) ?? "—"}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-medium">Total</TableCell>
                        <TableCell className="text-right font-bold">₹{selectedOrder.pricing?.total?.toFixed(2) ?? "—"}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Update status buttons */}
              <div className="pt-4 border-t">
                <h3 className="font-medium mb-2">Update Order Status</h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    className="bg-blue-100 text-blue-800 hover:bg-blue-200"
                    onClick={() => handleUpdateStatus("pending")}
                    disabled={selectedOrder.status === "pending"}
                  >
                    Pending
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                    onClick={() => handleUpdateStatus("confirmed")}
                    disabled={selectedOrder.status === "confirmed"}
                  >
                    Confirmed
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                    onClick={() => handleUpdateStatus("delivered")}
                    disabled={selectedOrder.status === "delivered"}
                  >
                    Delivered
                  </Button>
                  <Button
                    variant="outline"
                    className="bg-red-100 text-red-800 hover:bg-red-200"
                    onClick={() => handleUpdateStatus("cancelled")}
                    disabled={selectedOrder.status === "cancelled"}
                  >
                    Cancelled
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Toaster />
    </MenuProvider>
  )
}