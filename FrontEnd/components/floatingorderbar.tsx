"use client";

import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOrderSelection } from "./providers/order-selection-provider";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  ShoppingBag,
  X,
  ChevronRight,
  Plus,
  Minus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";

export function FloatingOrderBar() {
  const {
    selectedItems,
    totalItems,
    totalPrice,
    clearSelection,
    updateQty,
    toggleSelect,
  } = useOrderSelection();

  const router = useRouter();
  const [open, setOpen] = useState(false);

  const SESSION_KEY = "BiteNest_order_selection";

  const handlePlaceOrder = () => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(selectedItems));
    setOpen(false);
    router.push("/checkout?source=selection");
  };

  const subtotal = totalPrice;
  const tax = Math.round(subtotal * 0.05);
  const deliveryFee = subtotal >= 500 ? 0 : 40;
  const total = subtotal + tax + deliveryFee;

  return (
    <>
      {/* ── Floating trigger bar ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedItems.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-brand-primary/20 px-4 py-3 flex items-center gap-3">
              {/* Item count pill */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center shadow">
                <span className="text-white text-sm font-bold">
                  {totalItems}
                </span>
              </div>

              {/* Summary — click to open sheet */}
              <button
                onClick={() => setOpen(true)}
                className="flex-1 min-w-0 text-left"
              >
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {selectedItems.length} item
                  {selectedItems.length > 1 ? "s" : ""} selected
                  <span className="text-gray-400 font-normal ml-1">
                    · tap to review
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Total:{" "}
                  <span className="font-semibold text-brand-primary">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </p>
              </button>

              {/* Clear */}
              <button
                onClick={clearSelection}
                className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label="Clear selection"
              >
                <X className="h-3.5 w-3.5 text-gray-500" />
              </button>

              {/* Place Order */}
              <button
                onClick={handlePlaceOrder}
                className="flex-shrink-0 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white rounded-xl px-4 h-9 text-sm font-semibold flex items-center gap-1.5 transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                Place Order
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Sheet ────────────────────────────────────────────────────────── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-md p-0 flex flex-col bg-gradient-to-b from-orange-50 to-pink-50"
        >
          {/* Header */}
          <SheetHeader className="px-5 pt-5 pb-3">
            <SheetTitle className="flex items-center gap-2 text-xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
              <UtensilsCrossed className="h-5 w-5 text-brand-primary" />
              Your Order
            </SheetTitle>
            <p className="text-xs text-gray-500 mt-0.5">
              Review your items before placing the order
            </p>
          </SheetHeader>

          <Separator className="mx-5" />

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {selectedItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Item card */}
                <div className="bg-white rounded-2xl shadow-sm border border-pink-100 overflow-hidden">
                  <div className="flex gap-3 p-3">
                    {/* Image */}
                    <div className="relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg";
                        }}
                      />
                      {/* Veg / Non-veg dot */}
                      <span
                        className={`absolute top-1 left-1 w-3 h-3 rounded-full border-2 border-white shadow-sm
                        ${item.type === "Veg" ? "bg-green-500" : "bg-red-500"}`}
                      />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                          {item.title}
                        </p>
                        {/* Remove button */}
                        <button
                          onClick={() =>
                            toggleSelect({
                              id: item.id,
                              title: item.title,
                              price: item.price,
                              image: item.image,
                              type: item.type,
                              restaurantId: (item as any).restaurantId ?? "",
                            })
                          }
                          className="flex-shrink-0 w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5 text-red-400" />
                        </button>
                      </div>

                      {/* Price */}
                      <p className="text-base font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mt-1">
                        ₹{item.price.toFixed(2)}
                      </p>

                      {/* Quantity row */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 bg-orange-50 border border-brand-primary/20 rounded-lg px-2 py-1">
                          <button
                            onClick={() =>
                              updateQty(item.id, item.quantity - 1)
                            }
                            className="w-5 h-5 rounded-full bg-white border border-brand-primary/30 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold text-brand-primary w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQty(item.id, item.quantity + 1)
                            }
                            className="w-5 h-5 rounded-full bg-white border border-brand-primary/30 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Line total */}
                        <span className="text-sm font-semibold text-gray-700">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Footer — pricing + CTA */}
          <SheetFooter className="px-5 pb-6 pt-4 flex-col gap-0 border-t border-pink-100 bg-white">
            {/* Pricing breakdown */}
            <div className="w-full space-y-2 mb-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>GST (5%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Delivery</span>
                <span
                  className={
                    deliveryFee === 0 ? "text-green-600 font-medium" : ""
                  }
                >
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              {subtotal < 500 && (
                <p className="text-xs text-orange-500">
                  Add ₹{(500 - subtotal).toFixed(0)} more for free delivery
                </p>
              )}
              <Separator className="my-1" />

              {/* Total row — prominent */}
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900 text-base">Total</span>
                <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                  ₹{total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Place Order CTA — price removed from button label */}
            <button
              onClick={handlePlaceOrder}
              className="w-full bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white rounded-xl h-12 text-base font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-primary/25"
            >
              <ShoppingBag className="h-5 w-5" />
              Place Order
            </button>

            <button
              onClick={clearSelection}
              className="w-full mt-2 h-9 text-sm text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear all items
            </button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
