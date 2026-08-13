"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp, Heart, IndianRupee, Package, ShoppingBag, Users } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js"
import { Line, Bar, Doughnut } from "react-chartjs-2"
import { useEffect, useState } from "react"
import { useGetMyOrders, useGetCart, useGetUserProfile, useGetWishlist } from "@/src/hooks/useUser"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement)

export default function CustomerDashboard() {
  const [isClient, setIsClient] = useState(false)

  // Fetch real data from API
  const { data: ordersResponse } = useGetMyOrders()
  const { data: cartResponse } = useGetCart()
  const { data: profileResponse } = useGetUserProfile()

  const orders = ordersResponse?.data || []
  const profile = profileResponse?.data

  const { data: wishlistResponse, isLoading: wishlistLoading } = useGetWishlist()
  const wishlistItems: any[] = wishlistResponse?.data || []

  // Use useEffect to ensure charts only render on client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Compute real stats from orders
  const totalSpent = orders.reduce((sum, order) => sum + (order.pricing?.total || 0), 0)
  const completedOrders = orders.filter(o => o.orderstatus === "confirmed" && o.deliverystatus === "delivered").length
  const pendingOrders = orders.filter(o => o.orderstatus === "pending" || (o.orderstatus === "confirmed" && o.deliverystatus !== "delivered")).length
  const cancelledOrders = orders.filter(o => o.orderstatus === "cancelled").length
  const totalOrders = orders.length

  // Group orders by month for chart (last 6 months)
  const monthlySpending: Record<string, number> = {}
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]

  orders.forEach(order => {
    const date = new Date(order.createdAt)
    const monthIndex = date.getMonth()
    const monthLabel = monthNames[monthIndex] || "Other"
    monthlySpending[monthLabel] = (monthlySpending[monthLabel] || 0) + (order.pricing?.total || 0)
  })

  const salesData = {
    labels: monthNames,
    datasets: [
      {
        label: "Spending",
        data: monthNames.map(m => monthlySpending[m] || 0),
        borderColor: "hsl(16, 85%, 53%)",
        backgroundColor: "rgba(255, 99, 132, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }

  // Group orders by category for chart
  const categoryOrders: Record<string, number> = {}
  orders.forEach(order => {
    order.items?.forEach((item: any) => {
      const itemName = item.name || "Other"
      categoryOrders[itemName] = (categoryOrders[itemName] || 0) + item.quantity
    })
  })

  const categoryLabels = Object.keys(categoryOrders).slice(0, 6)
  const categoryValues = categoryLabels.map(label => categoryOrders[label])

  const categoryData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ["No orders yet"],
    datasets: [
      {
        label: "Order Count",
        data: categoryValues.length > 0 ? categoryValues : [0],
        backgroundColor: [
          "hsl(16, 85%, 53%)",
          "hsl(200, 98%, 39%)",
          "hsl(43, 96%, 56%)",
          "hsl(280, 85%, 60%)",
          "hsl(120, 70%, 45%)",
          "hsl(340, 85%, 60%)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const orderStatusData = {
    labels: ["Delivered", "Pending", "Cancelled"],
    datasets: [
      {
        data: [completedOrders, pendingOrders, cancelledOrders],
        backgroundColor: ["hsl(120, 70%, 45%)", "hsl(200, 98%, 39%)", "hsl(0, 84%, 60%)"],
        borderWidth: 1,
      },
    ],
  }

  return (
    <>
            <div className="container mx-auto px-4 py-8">
              <h1 className="text-3xl font-satisfy text-brand-primary mb-6">My Dashboard</h1>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Spent</p>
                        <h3 className="text-2xl font-bold mt-1">₹{totalSpent.toLocaleString("en-IN")}</h3>
                        <div className="flex items-center mt-1 text-green-600">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">{totalOrders} orders</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-brand-primary/10 rounded-full flex items-center justify-center">
                        <IndianRupee className="h-6 w-6 text-brand-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Total Orders</p>
                        <h3 className="text-2xl font-bold mt-1">{totalOrders}</h3>
                        <div className="flex items-center mt-1 text-green-600">
                          <ArrowUp className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">{completedOrders} delivered</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-brand-secondary/10 rounded-full flex items-center justify-center">
                        <ShoppingBag className="h-6 w-6 text-brand-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">In Progress</p>
                        <h3 className="text-2xl font-bold mt-1">{pendingOrders}</h3>
                        <div className="flex items-center mt-1 text-blue-600">
                          <ShoppingBag className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Orders being prepared</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-brand-accent/10 rounded-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-brand-accent" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Cancelled</p>
                        <h3 className="text-2xl font-bold mt-1">{cancelledOrders}</h3>
                        <div className="flex items-center mt-1 text-red-600">
                          <ArrowDown className="h-4 w-4 mr-1" />
                          <span className="text-xs font-medium">Cancelled orders</span>
                        </div>
                      </div>
                      <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <Card>
                  <CardHeader>
                    <CardTitle>Sales Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isClient && <Line data={salesData} height={300} options={{ maintainAspectRatio: false }} />}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Orders by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isClient && <Bar data={categoryData} height={300} options={{ maintainAspectRatio: false }} />}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                  <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    {isClient && (
                      <div style={{ height: "250px", width: "250px" }}>
                        <Doughnut
                          data={orderStatusData}
                          options={{
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: "bottom",
                              },
                            },
                          }}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Order ID</th>
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Items</th>
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Date</th>
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Amount</th>
                            <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                                No orders yet
                              </td>
                            </tr>
                          ) : (
                            orders.slice(0, 5).map((order: any) => {
                              const isCancelled      = order.orderstatus === "cancelled"
                              const isDelivered      = order.deliverystatus === "delivered"
                              const isOutForDelivery = order.deliverystatus === "out_for_delivery"
                              const isConfirmed      = order.orderstatus === "confirmed"

                              const statusLabel = isCancelled      ? "Cancelled"
                                : isDelivered      ? "Delivered"
                                : isOutForDelivery ? "Out for Delivery"
                                : isConfirmed      ? "Processing"
                                : "Pending"

                              const statusClass = isCancelled      ? "bg-red-100 text-red-700"
                                : isDelivered      ? "bg-green-100 text-green-700"
                                : isOutForDelivery ? "bg-orange-100 text-orange-700"
                                : isConfirmed      ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"

                              const itemSummary = order.items?.slice(0, 2)
                                .map((i: any) => i.name || i.menuItemId?.name || "Item")
                                .join(", ") + (order.items?.length > 2 ? ` +${order.items.length - 2}` : "")

                              return (
                                <tr key={order._id} className="border-b hover:bg-gray-50">
                                  <td className="py-3 px-2 text-sm font-medium text-gray-800">
                                    {order.orderId}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-gray-600 max-w-[140px] truncate">
                                    {itemSummary || `${order.items?.length ?? 0} item(s)`}
                                  </td>
                                  <td className="py-3 px-2 text-sm text-gray-500">
                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                      day: "numeric", month: "short", year: "numeric",
                                    })}
                                  </td>
                                  <td className="py-3 px-2 text-sm font-semibold text-gray-800">
                                    ₹{(order.pricing?.total ?? 0).toLocaleString("en-IN")}
                                  </td>
                                  <td className="py-3 px-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClass}`}>
                                      {statusLabel}
                                    </span>
                                  </td>
                                </tr>
                              )
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Favorites Section */}
              <div className="mt-8">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-brand-primary fill-brand-primary" />
                    <h2 className="text-xl font-semibold text-gray-800">Your Favourites</h2>
                    {wishlistItems.length > 0 && (
                      <span className="bg-brand-primary/10 text-brand-primary text-xs font-medium px-2 py-0.5 rounded-full">
                        {wishlistItems.length} items
                      </span>
                    )}
                  </div>
                  {wishlistItems.length > 0 && (
                    <Link href="/customer/favorites">
                      <Button variant="ghost" size="sm" className="text-brand-primary hover:text-brand-primary/80 text-sm font-medium">
                        View all →
                      </Button>
                    </Link>
                  )}
                </div>

                {wishlistLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
                    ))}
                  </div>
                ) : wishlistItems.length === 0 ? (
                  <div className="bg-gradient-to-br from-pink-50 to-orange-50 border border-pink-100 rounded-2xl p-10 text-center">
                    <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Heart className="h-8 w-8 text-brand-primary" />
                    </div>
                    <p className="text-gray-600 font-medium mb-1">No favourites yet</p>
                    <p className="text-gray-400 text-sm mb-4">Add items you love to quickly order them again</p>
                    <Link href="/">
                      <Button size="sm" className="bg-brand-primary hover:bg-brand-primary/90 text-white">
                        Browse Menu
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {wishlistItems.slice(0, 8).map((item: any) => (
                      <ProductCard key={item._id} product={item} />
                    ))}
                  </div>
                )}
              </div>

            </div>
    </>
  )
}

