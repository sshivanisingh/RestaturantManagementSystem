"use client"

import { useState, useEffect, Suspense, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeys } from "@/src/api/queryKeys"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import Link from "next/link"

import { Button }   from "@/components/ui/button"
import { Input }    from "@/components/ui/input"
import { Label }    from "@/components/ui/label"
import AddressAutocomplete from "@/components/AddressAutocomplete/AddressAutocomplete"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator }  from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge }      from "@/components/ui/badge"

import { useCart }  from "@/components/providers/cart-provider"
import { useAuth }  from "@/components/providers/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import Navbar       from "@/components/Navbar/navbar"

import {
  useCreateOrder,
  useInitiateRazorpayPayment,
  useVerifyRazorpayPayment,
  useConfirmCODOrder,
} from "@/src/hooks/useUser"


import {
  CreditCard, Banknote, QrCode,
  MapPin, User, Clock, ShoppingCart,
  CheckCircle, Loader2, Package,
} from "lucide-react"

import type { SelectedItem } from "@/components/providers/order-selection-provider"
import { useOrderSelection } from "@/components/providers/order-selection-provider"

const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID!
const SESSION_KEY   = "hotelhub_order_selection"

 

// ─── Razorpay script loader ───────────────────────────────────────────────────
const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) return resolve(true)
    const s   = document.createElement("script")
    s.id      = "razorpay-script"
    s.src     = "https://checkout.razorpay.com/v1/checkout.js"
    s.onload  = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })

// ─── Form shape ───────────────────────────────────────────────────────────────
interface CheckoutForm {
  firstName    : string
  lastName     : string
  email        : string
  phone        : string
  address      : string
  city         : string
  zipCode      : string
  notes        : string
  paymentMethod: "cash" | "card" | "digital"
}

const emptyForm: CheckoutForm = {
  firstName: "", lastName: "", email: "", phone: "",
  address: "", city: "", zipCode: "", notes: "",
  paymentMethod: "cash",
}

// ─── Inner component (needs useSearchParams) ──────────────────────────────────
function CheckoutInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const { toast }    = useToast()
  const queryClient  = useQueryClient()

  const { items: cartItems, clearCart }  = useCart()
  const { user }                         = useAuth()
  const { clearSelection }               = useOrderSelection()

  const [form, setForm]                   = useState<CheckoutForm>(emptyForm)
  const [mounted, setMounted]             = useState(false)
  const [submitting, setSubmitting]       = useState(false)
  const [checkoutItems, setCheckoutItems] = useState<SelectedItem[]>([])


  // Params kept for display purposes only (e.g. subtitle text)
  const source = searchParams.get("source")

  // ── Resolve items ──────────────────────────────────────────────────────────
  // Always read from sessionStorage — single source of truth.
  // Both FloatingOrderBar and ProductCard (buyNow) write to sessionStorage
  // before navigating here, so we never fall back to cartItems.
  useEffect(() => {
    setMounted(true)

    let items: SelectedItem[] = []

    try {
      const raw = sessionStorage.getItem(SESSION_KEY)

      if (raw) items = JSON.parse(raw) as SelectedItem[]
    } catch {
      items = []
    }

    if (items.length === 0) {
      router.push("/cart")
      return
    }

    setCheckoutItems(items)

    // Pre-fill form from logged-in user profile
    if (user) {
      setForm((prev) => ({
        ...prev,
        firstName: (user.name as string)?.split(" ")[0]                 || "",
        lastName : (user.name as string)?.split(" ").slice(1).join(" ") || "",
        email    : (user.email as string)                    || "",
        phone    : (user as any).phone                      || "",
      }))
    }
  }, [source])  



  // ── Pricing ────────────────────────────────────────────────────────────────
  const subtotal    = checkoutItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const tax         = Math.round(subtotal * 0.05)
  const deliveryFee = subtotal >= 500 ? 0 : 40
  const total       = subtotal + tax + deliveryFee

  // ── API mutations ──────────────────────────────────────────────────────────
  const { mutateAsync: createOrder }     = useCreateOrder()
  const { mutateAsync: initiatePayment } = useInitiateRazorpayPayment()
  const { mutateAsync: verifyPayment }   = useVerifyRazorpayPayment()
  const { mutateAsync: confirmCOD }      = useConfirmCODOrder()




  
  // ── Form helpers ───────────────────────────────────────────────────────────
  const handleInputChange = (field: keyof CheckoutForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const validateForm = (): boolean => {
    const required: (keyof CheckoutForm)[] = [
      "firstName", "lastName", "email", "phone", "address", "city", "zipCode",
    ]
    if (required.some((f) => !form[f]?.toString().trim())) {
      toast({
        title      : "Missing Information",
        description: "Please fill in all required fields.",
        variant    : "destructive",
      })
      return false
    }
    return true
  }

  // ── Place order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validateForm()) return
    setSubmitting(true)

    try {
      const { data: orderData } = await createOrder({
        items: checkoutItems.map((item) => ({
          menuItemId: item.id,
          quantity  : item.quantity,
        })),
        deliveryInfo: {
          name   : `${form.firstName} ${form.lastName}`.trim(),
          email  : form.email,
          phone  : form.phone,
          address: form.address,
          city   : form.city,
          pincode: form.zipCode,
          type   : "delivery",
        },
        paymentMethod: form.paymentMethod === "cash" ? "COD" : "RAZORPAY",
        notes        : form.notes || undefined,
      })

      const orderId = orderData?.order?._id

      if (!orderId) {
        toast({ title: "Order creation failed", variant: "destructive" })
        setSubmitting(false)
        return
      }

      // Online payment via Razorpay
      if (form.paymentMethod !== "cash") {
        const loaded = await loadRazorpayScript()
        if (!loaded) {
          toast({ title: "Payment gateway failed to load.", variant: "destructive" })
          setSubmitting(false)
          return
        }

        const { data: payData } = await initiatePayment({ orderId, restaurantId: checkoutItems[0]?.restaurantId ?? "" })

        await new Promise<void>((resolve, reject) => {
          const rzp = new (window as any).Razorpay({
            key        : payData.keyId,
            amount     : payData.amount,
            currency   : payData.currency,
            order_id   : payData.razorpayOrderId,
            name       : "HotelHub",
            description: "Food Order",
            prefill    : {
              name   : `${form.firstName} ${form.lastName}`,
              email  : form.email,
              contact: form.phone,
            },
            theme: { color: "#f97316" },
            handler: async (response: any) => {
              try {
                await verifyPayment({
                  razorpay_order_id  : response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature : response.razorpay_signature,
                  paymentId          : payData.paymentId,
                })
                clearCart()
                clearSelection()
                sessionStorage.removeItem(SESSION_KEY)
                if (user) {
                  await queryClient.refetchQueries({ queryKey: queryKeys.user.orders() })
                  toast({ title: "🎉 Order placed successfully!", duration: 3000 })
                  router.push(`/customer/orders`)
                } else {
                  toast({
                    title      : "🎉 Payment successful!",
                    description: "Check your email — we've sent your login credentials so you can track this order.",
                    duration   : 6000,
                  })
                  router.push(`/resturent`)
                }
                resolve()
              } catch {
                toast({ title: "Payment verification failed. Please contact support.", variant: "destructive" })
                reject(new Error("verify_failed"))
              }
            },
            modal: {
              ondismiss: () => {
                toast({ title: "Payment cancelled.", variant: "destructive" })
                reject(new Error("dismissed"))
              },
            },
          })
          rzp.open()
        })
      }
      

      // COD flow
      if (form.paymentMethod === "cash") {
        await confirmCOD({ orderId, restaurantId: checkoutItems[0]?.restaurantId ?? "" })
        clearCart()
        clearSelection()
        sessionStorage.removeItem(SESSION_KEY)
        if (user) {
          await queryClient.refetchQueries({ queryKey: queryKeys.user.orders() })
          toast({ title: "🎉 Order placed! Pay on delivery.", duration: 3000 })
          router.push(`/customer/orders`)
        } else {
          toast({
            title      : "🎉 Order placed!",
            description: "Check your email — we've sent your login credentials so you can track this order.",
            duration   : 6000,
          })
          router.push(`/resturent`)
        }
      }
     
    } catch (err: any) {
      if (err?.message !== "dismissed" && err?.message !== "verify_failed") {
        toast({
          title      : "Order Failed",
          description: "Something went wrong. Please try again.",
          variant    : "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 font-medium">Loading checkout...</p>
          </div>
        </main>
      </div>
    )
  }

  if (checkoutItems.length === 0) return null

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    // Extra bottom padding so sticky button doesn't cover content on mobile
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50 pb-28 lg:pb-0">
      <Navbar />

      <div className="container mx-auto px-4 py-8">

        {/* Page heading */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="mb-6">
            <h1 className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
              Checkout
            </h1>
            <p className="text-gray-500 mt-1">
              {source === "selection"
                ? `${checkoutItems.length} item${checkoutItems.length > 1 ? "s" : ""} selected`
                : "Complete your order"}
            </p>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* ── Left: Forms ─────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Customer Information */}
            <Card className="border border-pink-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="mr-2 h-5 w-5 text-brand-primary" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" value={form.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                    placeholder="Rahul" />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" value={form.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                     placeholder="Kumar" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" value={form.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                     placeholder="rahul@email.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" value={form.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                     placeholder="9876543210" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Address */}
            <Card className="border border-pink-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="mr-2 h-5 w-5 text-brand-primary" />
                  Delivery Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <AddressAutocomplete
                    value={form.address}
                    onChange={(val) => handleInputChange("address", val)}
                    onSelect={({ fullAddress, city, pincode }) => {
                      handleInputChange("address", fullAddress)
                      if (city)    handleInputChange("city",    city)
                      if (pincode) handleInputChange("zipCode", pincode)
                    }}
                    placeholder="Search your delivery address..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" value={form.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                     placeholder="Delhi" />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">Pincode *</Label>
                    <Input id="zipCode" value={form.zipCode}
                      onChange={(e) => handleInputChange("zipCode", e.target.value)}
                     placeholder="110001" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                  <Textarea id="notes" value={form.notes}
                    onChange={(e) => handleInputChange("notes", e.target.value)}
                    className="border-2 border-gray-200 focus:border-brand-primary mt-1"
                    placeholder="Any special instructions for delivery..." rows={3} />
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card className="border border-pink-100 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="mr-2 h-5 w-5 text-brand-primary" />
                  Payment Method
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup value={form.paymentMethod}
                  onValueChange={(v) => handleInputChange("paymentMethod", v)}
                  className="space-y-3"
                >
                  {[
                    { value: "cash",    icon: <Banknote className="mr-3 h-5 w-5 text-green-600" />,  label: "Cash on Delivery",     sub: "Pay when your order arrives",        badge: "Recommended" },
                    { value: "card",    icon: <CreditCard className="mr-3 h-5 w-5 text-blue-600" />, label: "Credit / Debit Card",  sub: "Pay securely via Razorpay",          badge: null },
                    { value: "digital", icon: <QrCode className="mr-3 h-5 w-5 text-purple-600" />,  label: "UPI / Digital Wallet", sub: "Google Pay, PhonePe, Paytm & more",  badge: null },
                  ].map((opt) => (
                    <div key={opt.value}
                      className={`flex items-center space-x-3 p-4 border-2 rounded-xl transition-all cursor-pointer
                        ${form.paymentMethod === opt.value
                          ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                          : "border-gray-200 hover:border-brand-primary/50"}`}
                    >
                      <RadioGroupItem value={opt.value} id={opt.value} />
                      <Label htmlFor={opt.value} className="flex items-center cursor-pointer flex-1">
                        {opt.icon}
                        <div>
                          <div className="font-medium text-gray-800">{opt.label}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{opt.sub}</div>
                        </div>
                        {opt.badge && (
                          <Badge className="ml-auto bg-green-100 text-green-700 border-0">{opt.badge}</Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>
          </motion.div>

          {/* ── Right: Order Summary (desktop only) ───────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-1 hidden lg:block"
          >
            <Card className="border border-pink-100 shadow-lg sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <ShoppingCart className="mr-2 h-5 w-5 text-brand-primary" />
                  Order Summary
                  {source === "selection" && (
                    <Badge className="ml-2 bg-orange-100 text-orange-700 border-0 text-xs">
                      {checkoutItems.length} items
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">

                {/* Items list */}
                <div className="space-y-3 max-h-52 overflow-y-auto pr-1">
                  {checkoutItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.currentTarget.src = "/placeholder.svg" }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-1 text-gray-800">{item.title}</div>
                        <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-semibold text-sm text-gray-700 whitespace-nowrap">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Pricing breakdown */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                      {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                    </span>
                  </div>
                  {subtotal < 500 && (
                    <p className="text-xs text-orange-500">Add ₹{(500 - subtotal).toFixed(0)} more for free delivery</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                    ₹{total.toFixed(2)}
                  </span>
                </div>

                {/* Delivery time */}
                <div className="bg-orange-50 p-3 rounded-xl">
                  <div className="flex items-center text-sm font-medium text-orange-800 mb-0.5">
                    <Clock className="mr-2 h-4 w-4" />Estimated Delivery
                  </div>
                  <div className="text-xs text-orange-600">30–45 minutes after confirmation</div>
                </div>

                {/* Place Order button — desktop */}
                <Button
                  className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white h-12 rounded-xl font-semibold shadow-lg shadow-brand-primary/20"
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</>
                  ) : (
                    <><CheckCircle className="mr-2 h-5 w-5" />
                      {form.paymentMethod === "cash" ? "Place Order (COD)" : "Proceed to Pay"}
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-gray-400">
                  By placing this order, you agree to our{" "}
                  <Link href="/terms" className="underline hover:text-brand-primary">Terms of Service</Link>
                </p>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      </div>

      {/* ── Sticky bottom bar — mobile only ─────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white border-t border-pink-100 shadow-2xl">
        <div className="px-4 py-3">

          {/* Mini pricing row */}
          <div className="flex items-center justify-between mb-2 text-sm">
            <div className="flex items-center gap-3 text-gray-500">
              <span>{checkoutItems.length} item{checkoutItems.length > 1 ? "s" : ""}</span>
              <span className="text-gray-300">·</span>
              <span>Tax ₹{tax.toFixed(2)}</span>
              <span className="text-gray-300">·</span>
              <span className={deliveryFee === 0 ? "text-green-600 font-medium" : ""}>
                {deliveryFee === 0 ? "FREE delivery" : `Delivery ₹${deliveryFee}`}
              </span>
            </div>
            <div className="font-bold text-base bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
              ₹{total.toFixed(2)}
            </div>
          </div>

          {/* Place Order button */}
          <Button
            className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white h-12 rounded-xl font-semibold text-base shadow-lg shadow-brand-primary/20"
            onClick={handlePlaceOrder}
            disabled={submitting}
          >
            {submitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing Order...</>
            ) : (
              <><Package className="mr-2 h-5 w-5" />
                {form.paymentMethod === "cash" ? "Place Order (COD)" : "Proceed to Pay"}
              </>
            )}
          </Button>
        </div>
      </div>

    </div>
  )
}

// ─── Page wrapper with Suspense (required for useSearchParams) ────────────────
export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <CheckoutInner />
    </Suspense>
  )
}