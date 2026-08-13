"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/auth-provider"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Clock, MapPin, Package, Truck, User, Download } from "lucide-react"
import { motion } from "framer-motion"
import { downloadInvoiceApi } from "@/src/api/order.api"
import { useState } from "react"

// Sample order data with real images
const orders = [
  {
    id: "1001",
    date: "March 15, 2025",
    status: "Delivered",
    statusColor: "bg-green-100 text-green-800",
    items: [
      {
        id: "1",
        name: "Fresh Vegetable Salad",
        quantity: 1,
        price: 17.99,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop",
      },
      {
        id: "4",
        name: "Fresh Orange Juice",
        quantity: 2,
        price: 12.99,
        image: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?q=80&w=1887&auto=format&fit=crop",
      },
    ],
    total: 43.97,
    subtotal: 41.88,
    tax: 2.09,
    deliveryAddress: "123 Main St, Apt 4B, New York, NY 10001",
    deliveryPerson: "John Delivery",
    deliveryPhone: "+1 (555) 123-4567",
    estimatedDelivery: "Delivered on March 15, 2025 at 2:30 PM",
    paymentMethod: "Credit Card (Visa ending in 4242)",
    orderSteps: [
      { title: "Order Placed", time: "March 15, 2025, 12:30 PM", completed: true },
      { title: "Order Confirmed", time: "March 15, 2025, 12:35 PM", completed: true },
      { title: "Preparing Food", time: "March 15, 2025, 12:45 PM", completed: true },
      { title: "Out for Delivery", time: "March 15, 2025, 1:30 PM", completed: true },
      { title: "Delivered", time: "March 15, 2025, 2:30 PM", completed: true },
    ],
  },
  {
    id: "1002",
    date: "March 12, 2025",
    status: "Delivered",
    statusColor: "bg-green-100 text-green-800",
    items: [
      {
        id: "2",
        name: "Gourmet Beef Burger",
        quantity: 1,
        price: 23.99,
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=1899&auto=format&fit=crop",
      },
      {
        id: "6",
        name: "Gourmet Veggie Burger",
        quantity: 1,
        price: 10.59,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=1965&auto=format&fit=crop",
      },
    ],
    total: 34.58,
    subtotal: 32.93,
    tax: 1.65,
    deliveryAddress: "123 Main St, Apt 4B, New York, NY 10001",
    deliveryPerson: "Sarah Delivery",
    deliveryPhone: "+1 (555) 987-6543",
    estimatedDelivery: "Delivered on March 12, 2025 at 1:15 PM",
    paymentMethod: "PayPal",
    orderSteps: [
      { title: "Order Placed", time: "March 12, 2025, 11:30 AM", completed: true },
      { title: "Order Confirmed", time: "March 12, 2025, 11:35 AM", completed: true },
      { title: "Preparing Food", time: "March 12, 2025, 11:45 AM", completed: true },
      { title: "Out for Delivery", time: "March 12, 2025, 12:30 PM", completed: true },
      { title: "Delivered", time: "March 12, 2025, 1:15 PM", completed: true },
    ],
  },
  {
    id: "1003",
    date: "March 18, 2025",
    status: "Processing",
    statusColor: "bg-blue-100 text-blue-800",
    items: [
      {
        id: "8",
        name: "Classic Spaghetti Carbonara",
        quantity: 1,
        price: 15.99,
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?q=80&w=1771&auto=format&fit=crop",
      },
      {
        id: "11",
        name: "Chocolate Lava Cake",
        quantity: 1,
        price: 7.99,
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=1989&auto=format&fit=crop",
      },
    ],
    total: 23.98,
    subtotal: 22.84,
    tax: 1.14,
    deliveryAddress: "123 Main St, Apt 4B, New York, NY 10001",
    deliveryPerson: "Pending Assignment",
    deliveryPhone: "",
    estimatedDelivery: "Expected delivery on March 18, 2025 between 1:00 PM - 2:00 PM",
    paymentMethod: "Credit Card (Mastercard ending in 5555)",
    orderSteps: [
      { title: "Order Placed", time: "March 18, 2025, 11:30 AM", completed: true },
      { title: "Order Confirmed", time: "March 18, 2025, 11:35 AM", completed: true },
      { title: "Preparing Food", time: "March 18, 2025, 11:45 AM", completed: true },
      { title: "Out for Delivery", time: "Pending", completed: false },
      { title: "Delivered", time: "Pending", completed: false },
    ],
  },
]

export default function OrderDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const orderId = params.id as string
  const [isDownloading, setIsDownloading] = useState(false)

  const order = orders.find((o) => o.id === orderId)

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true)
      const blob = await downloadInvoiceApi(orderId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `invoice-${orderId}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to download invoice:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  if (!order) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-pink-50 min-h-full">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-brand-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Order not found</h3>
            <p className="text-gray-500 mb-6">The order you're looking for doesn't exist</p>
            <Button
              className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
              asChild
            >
              <Link href="/customer/orders">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-pink-50 min-h-full">
      <div className="container mx-auto px-4 py-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-6 flex items-center"
                >
                  <Button variant="ghost" size="sm" className="mr-4" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-2">
                      Order Details
                    </h1>
                    <p className="text-gray-600">
                      Order #{order.id} • {order.date}
                    </p>
                  </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Order Summary */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="lg:col-span-2"
                  >
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100">
                      <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                          <h2 className="text-xl font-medium flex items-center">
                            <Package className="mr-2 h-5 w-5 text-brand-primary" />
                            Order Summary
                          </h2>
                          <Badge className={order.statusColor}>{order.status}</Badge>
                        </div>

                        <div className="space-y-6">
                          {/* Order Items */}
                          <div>
                            <h3 className="font-medium mb-3 text-gray-700">Items</h3>
                            <div className="space-y-4">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl">
                                  <div className="w-20 h-20 rounded-lg overflow-hidden">
                                    <img
                                      src={item.image || "/placeholder.svg"}
                                      alt={item.name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-gray-500">Quantity: {item.quantity}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                                    <div className="text-sm text-gray-500">${item.price.toFixed(2)} each</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Totals */}
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <h3 className="font-medium mb-3 text-gray-700">Payment Summary</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Subtotal</span>
                                <span>${order.subtotal.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Tax</span>
                                <span>${order.tax.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Delivery</span>
                                <span className="text-green-600">Free</span>
                              </div>
                              <div className="pt-2 border-t border-gray-200 mt-2">
                                <div className="flex justify-between font-medium">
                                  <span>Total</span>
                                  <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                                    ${order.total.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Payment Method */}
                          <div>
                            <h3 className="font-medium mb-3 text-gray-700">Payment Method</h3>
                            <div className="bg-gray-50 p-4 rounded-xl flex items-center">
                              <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center mr-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-brand-primary"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v6a3 3 0 003 3z"
                                  />
                                </svg>
                              </div>
                              <span>{order.paymentMethod}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Order Status and Delivery Info */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-1"
                  >
                    {/* Order Status */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100 mb-6">
                      <div className="p-6">
                        <h2 className="text-xl font-medium mb-4 flex items-center">
                          <Clock className="mr-2 h-5 w-5 text-brand-primary" />
                          Order Status
                        </h2>

                        <div className="space-y-6">
                          {order.orderSteps.map((step, index) => (
                            <div key={index} className="relative flex">
                              {/* Status line */}
                              {index < order.orderSteps.length - 1 && (
                                <div
                                  className={`absolute left-3 top-6 w-0.5 h-full ${step.completed ? "bg-green-500" : "bg-gray-300"}`}
                                ></div>
                              )}

                              {/* Status circle */}
                              <div
                                className={`relative z-10 flex-shrink-0 w-6 h-6 rounded-full ${step.completed ? "bg-green-500" : "bg-gray-300"} flex items-center justify-center mr-4`}
                              >
                                {step.completed && (
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>

                              {/* Status text */}
                              <div className="flex-1 pb-6">
                                <p className={`font-medium ${step.completed ? "text-gray-900" : "text-gray-500"}`}>
                                  {step.title}
                                </p>
                                <p className="text-sm text-gray-500">{step.time}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Delivery Information */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100">
                      <div className="p-6">
                        <h2 className="text-xl font-medium mb-4 flex items-center">
                          <Truck className="mr-2 h-5 w-5 text-brand-primary" />
                          Delivery Information
                        </h2>

                        <div className="space-y-4">
                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-start">
                              <MapPin className="h-5 w-5 text-brand-primary mr-3 mt-0.5" />
                              <div>
                                <p className="font-medium">Delivery Address</p>
                                <p className="text-gray-600 text-sm">{order.deliveryAddress}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 p-4 rounded-xl">
                            <div className="flex items-start">
                              <Clock className="h-5 w-5 text-brand-primary mr-3 mt-0.5" />
                              <div>
                                <p className="font-medium">Delivery Time</p>
                                <p className="text-gray-600 text-sm">{order.estimatedDelivery}</p>
                              </div>
                            </div>
                          </div>

                          {order.deliveryPerson !== "Pending Assignment" && (
                            <div className="bg-gray-50 p-4 rounded-xl">
                              <div className="flex items-start">
                                <User className="h-5 w-5 text-brand-primary mr-3 mt-0.5" />
                                <div>
                                  <p className="font-medium">Delivery Person</p>
                                  <p className="text-gray-600 text-sm">{order.deliveryPerson}</p>
                                  {order.deliveryPhone && (
                                    <p className="text-gray-600 text-sm">{order.deliveryPhone}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 space-y-3">
                          <Button
                            onClick={handleDownloadInvoice}
                            disabled={isDownloading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white"
                          >
                            <Download className="mr-2 h-4 w-4" />
                            {isDownloading ? "Downloading..." : "Download Invoice"}
                          </Button>
                          <Button
                            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                            asChild
                          >
                            <Link href="/orders">
                              <ArrowLeft className="mr-2 h-4 w-4" />
                              Back to Orders
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
      </div>
    </div>
  )
}

