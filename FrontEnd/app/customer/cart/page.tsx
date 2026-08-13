"use client"

import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart, Trash2, CreditCard, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/providers/auth-provider"
import { useToast } from "@/components/ui/use-toast"
import { motion } from "framer-motion"
import { useRemoveFromCart, useGetCart, useUpdateCartItem, useClearCart } from "@/src/hooks/useUser"

// ─── Same SESSION_KEY as checkout page ────────────────────────────────────────
const SESSION_KEY   = "hotelhub_order_selection"
const RESTAURANT_ID = process.env.NEXT_PUBLIC_RESTAURANT_ID!


export default function CartPage() {
  const [couponCode, setCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { toast } = useToast()

  const { data: cartResponse } = useGetCart()
  const cartItems = cartResponse?.data || []

  const { mutateAsync: updateItemAsync } = useUpdateCartItem()
  const { mutateAsync: removeItemAsync } = useRemoveFromCart()
  const { mutateAsync: clearCartAsync } = useClearCart()

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      await updateItemAsync({ menuItemId: itemId, quantity: newQuantity })
      toast({
        title: "Success",
        description: "Quantity updated",
      })
    } catch (error) {
      console.error("Error updating quantity:", error)
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      })
    }
  }

  const removeFromCart = async (itemId: string) => {
    try {
      await removeItemAsync(itemId)
      toast({
        title: "Success",
        description: "Item removed from cart",
      })
    } catch (error) {
      console.error("Error removing item from cart:", error)
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive",
      })
    }
  }

  const clearCart = async () => {
    try {
      await clearCartAsync()
      toast({
        title: "Cart cleared",
        description: "All items removed from cart",
      })
    } catch (error) {
      console.error("Error clearing cart:", error)
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive",
      })
    }
  }

  const handleApplyCoupon = () => {
    setIsApplyingCoupon(true)
    setTimeout(() => {
      toast({
        title: "Invalid coupon",
        description: "The coupon code you entered is invalid or expired.",
        variant: "destructive",
      })
      setIsApplyingCoupon(false)
    }, 1000)
  }

  // ─── MAIN CHANGE: sessionStorage mein items dalo, phir checkout pe jao ──────
  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout")
      return
    }

    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add some items before checkout.",
        variant: "destructive",
      })
      return
    }

    // Cart items ko checkout page ke SelectedItem format mein convert karo
    const selectionItems = cartItems.map(item => ({
      id          : item.menuItemId._id,
      title       : item.menuItemId.name,
      price       : item.menuItemId.discountedPrice || item.menuItemId.price,
      quantity    : item.quantity,
      image       : item.menuItemId.image || "",
      restaurantId: item.menuItemId.restaurantId || RESTAURANT_ID,
    }))

    // sessionStorage mein save karo — checkout page yahi se padhta hai
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(selectionItems))

    // Checkout page pe redirect karo with source=cart
    router.push("/checkout?source=cart")
  }



  // ─── Totals ───────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.menuItemId.discountedPrice || item.menuItemId.price
    return sum + price * item.quantity
  }, 0)

  const tax   = subtotal * 0.05
  const total = subtotal + tax

  // ─── Not authenticated view ───────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-pink-50 flex items-center justify-center min-h-[60vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto border border-pink-100"
            >
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
                  <ShoppingCart className="h-10 w-10 text-brand-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-medium mb-2">Please Login</h2>
              <p className="text-gray-600 mb-6">Please login to view your cart items.</p>
              <Button
                className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                size="lg"
                asChild
              >
                <Link href="/login">Login to Continue</Link>
              </Button>
            </motion.div>
      </div>
    )
  }

  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <div className="bg-gradient-to-br from-orange-50 to-pink-50 min-h-full">
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-2">
                Your Shopping Cart
              </h1>
              <p className="text-gray-600 mb-6">Review your items and proceed to checkout</p>
            </motion.div>

            {cartItems && cartItems.length > 0 ? (
              <div className="flex flex-col lg:flex-row gap-8">

                {/* ── Cart Items ─────────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="lg:w-2/3"
                >
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-pink-100">
                    <div className="p-6">
                      <h2 className="text-xl font-medium mb-4 flex items-center">
                        <ShoppingCart className="mr-2 h-5 w-5 text-brand-primary" />
                        Cart Items ({cartItems.length})
                      </h2>

                      <div className="divide-y">
                        {cartItems.map((item, index) => {
                          const menuItem      = item.menuItemId
                          const discount      = menuItem.discountPercent || 0
                          const price         = menuItem.discountedPrice || menuItem.price
                          const originalPrice = menuItem.price

                          return (
                            <motion.div
                              key={menuItem._id}
                              className="py-6 flex flex-col sm:flex-row gap-4"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                              <div className="sm:w-32 sm:h-32 flex-shrink-0 rounded-xl overflow-hidden">
                                <img
                                  src={
                                    menuItem.image ||
                                    "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop"
                                  }
                                  alt={menuItem.name}
                                  className="w-full h-full object-cover"
                                  onError={e => {
                                    e.currentTarget.src =
                                      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop"
                                  }}
                                />
                              </div>

                              <div className="flex-1">
                                <Link
                                  href={`/product/${menuItem._id}`}
                                  className="text-lg font-medium hover:text-brand-primary"
                                >
                                  {menuItem.name}
                                </Link>

                                <div className="flex items-center gap-2 mt-1">
                                  <span
                                    className={`w-2 h-2 rounded-full ${
                                      menuItem.type === "Veg" ? "bg-green-600" : "bg-red-600"
                                    }`}
                                  />
                                  <span className="text-sm text-gray-500">{menuItem.type}</span>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                  {/* Quantity controls */}
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 rounded-full border-2 border-gray-200"
                                      onClick={() => updateQuantity(menuItem._id, item.quantity - 1)}
                                      disabled={item.quantity <= 1}
                                    >
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      className="h-8 w-8 rounded-full border-2 border-gray-200"
                                      onClick={() => updateQuantity(menuItem._id, item.quantity + 1)}
                                    >
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>

                                  {/* Price + remove */}
                                  <div className="flex items-center gap-4">
                                    <div className="text-right">
                                      <div className="font-medium text-brand-primary">
                                        ₹{(price * item.quantity).toFixed(2)}
                                      </div>
                                      {discount > 0 && (
                                        <div className="text-sm text-gray-500 line-through">
                                          ₹{(originalPrice * item.quantity).toFixed(2)}
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                                      onClick={() => removeFromCart(menuItem._id)}
                                    >
                                      <Trash2 className="h-5 w-5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <Button
                      variant="outline"
                      className="border-2 border-gray-200 hover:border-brand-primary"
                      asChild
                    >
                      <Link href="/">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Continue Shopping
                      </Link>
                    </Button>

                    <Button
                      variant="outline"
                      className="text-red-500 border-2 border-red-200 hover:bg-red-50 hover:border-red-500"
                      onClick={clearCart}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Clear Cart
                    </Button>
                  </div>
                </motion.div>

                {/* ── Order Summary ──────────────────────────────────── */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="lg:w-1/3"
                >
                  <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4 border border-pink-100">
                    <h2 className="text-xl font-medium mb-4 flex items-center">
                      <CreditCard className="mr-2 h-5 w-5 text-brand-primary" />
                      Order Summary
                    </h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax (5%)</span>
                        <span>₹{tax.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery</span>
                        <span className={subtotal >= 500 ? "text-green-600 font-medium" : ""}>
                          {subtotal >= 500 ? "Free" : "₹40.00"}
                        </span>
                      </div>

                      {subtotal < 500 && (
                        <p className="text-xs text-orange-500">
                          Add ₹{(500 - subtotal).toFixed(0)} more for free delivery
                        </p>
                      )}

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex justify-between font-medium text-lg">
                          <span>Total</span>
                          <span className="bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent font-bold">
                            ₹{(subtotal < 500 ? total + 40 : total).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Including all taxes and fees</p>
                      </div>
                    </div>

                    {/* Coupon */}
                    <div className="mb-6">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          className="border-2 border-gray-200 focus:border-brand-primary"
                        />
                        <Button
                          variant="outline"
                          className="border-2 border-gray-200 hover:border-brand-primary"
                          onClick={handleApplyCoupon}
                          disabled={!couponCode || isApplyingCoupon}
                        >
                          {isApplyingCoupon ? "Applying..." : "Apply"}
                        </Button>
                      </div>
                    </div>

                    {/* ── Proceed to Checkout button ── */}
                    <Button
                      className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      <ArrowRight className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>

                    <div className="mt-4 text-center text-sm text-gray-500">
                      <p>Secure checkout powered by Razorpay</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ) : (
              /* ── Empty cart ─────────────────────────────────────────── */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md mx-auto border border-pink-100"
              >
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-pink-100 flex items-center justify-center">
                    <ShoppingCart className="h-10 w-10 text-brand-primary" />
                  </div>
                </div>
                <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
                <p className="text-gray-600 mb-6">
                  Looks like you haven't added any items to your cart yet.
                </p>
                <Button
                  className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                  size="lg"
                  asChild
                >
                  <Link href="/">Start Shopping</Link>
                </Button>
              </motion.div>
            )}
          </div>
    </div>
  )
}