"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, QrCode, Banknote, Edit2, X, ShoppingCart } from "lucide-react"
import { useCart } from "./providers/cart-provider"
import { CartItem } from "./cart-item"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import Navbar from "./Navbar/navbar"

export function Cart() {
  const { items, subtotal, tax, total, clearCart } = useCart()
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [isCheckoutDialogOpen, setIsCheckoutDialogOpen] = useState(false)
  const { toast } = useToast()

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before placing an order.",
        variant: "destructive",
      })
      return
    }

    setIsCheckoutDialogOpen(true)
  }

  const handleCheckout = () => {
    if (!paymentMethod) {
      toast({
        title: "Payment method required",
        description: "Please select a payment method to continue.",
        variant: "destructive",
      })
      return
    }

    // Process order
    toast({
      title: "Order placed successfully!",
      description: `Your order has been placed with ${paymentMethod} payment.`,
      variant: "default",
    })

    // Reset state
    clearCart()
    setPaymentMethod(null)
    setIsCheckoutDialogOpen(false)
    setIsCartOpen(false)
  }

  // Mobile cart toggle button
  const CartToggle = (
    <Button
      variant="default"
      size="icon"
      className="fixed bottom-4 right-4 z-50 rounded-full h-14 w-14 shadow-lg md:hidden bg-green-600 hover:bg-green-700"
      onClick={() => setIsCartOpen(!isCartOpen)}
    >
      <ShoppingCart className="h-6 w-6" />
      {items.length > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
          {items.length}
        </span>
      )}
    </Button>
  )

  return (
    <>
      {CartToggle}

      <div
        className={`
        fixed inset-y-0 right-0 w-full sm:w-[380px] bg-white border-l flex flex-col h-full z-40 transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isCartOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}
      `}
      >
        <div className="p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Table 4</h2>
            <p className="text-sm text-gray-500">Floyd Miles</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Edit2 className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsCartOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {items.length > 0 ? (
            items.map((item, index) => <CartItem key={index} {...item} />)
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <ShoppingCart className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-center">Your cart is empty</p>
              <p className="text-center text-sm">Add items from the menu to get started</p>
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Sub Total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax 5%</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Total Amount</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12"
            onClick={handlePlaceOrder}
            disabled={items.length === 0}
          >
            Place Order
          </Button>
        </div>
      </div>

      <Dialog open={isCheckoutDialogOpen} onOpenChange={setIsCheckoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Your Order</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <h3 className="font-medium">Select Payment Method</h3>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={paymentMethod === "Cash" ? "default" : "outline"}
                  className={`flex flex-col items-center py-2 ${paymentMethod === "Cash" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  onClick={() => setPaymentMethod("Cash")}
                >
                  <Banknote className="h-5 w-5 mb-1" />
                  <span className="text-xs">Cash</span>
                </Button>
                <Button
                  variant={paymentMethod === "Card" ? "default" : "outline"}
                  className={`flex flex-col items-center py-2 ${paymentMethod === "Card" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  onClick={() => setPaymentMethod("Card")}
                >
                  <CreditCard className="h-5 w-5 mb-1" />
                  <span className="text-xs">Card</span>
                </Button>
                <Button
                  variant={paymentMethod === "QR" ? "default" : "outline"}
                  className={`flex flex-col items-center py-2 ${paymentMethod === "QR" ? "bg-green-600 hover:bg-green-700" : ""}`}
                  onClick={() => setPaymentMethod("QR")}
                >
                  <QrCode className="h-5 w-5 mb-1" />
                  <span className="text-xs">QR Code</span>
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">Order Summary</h3>
              <div className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Items ({items.length})</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (5%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setIsCheckoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={handleCheckout} disabled={!paymentMethod}>
              Complete Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

