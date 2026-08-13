"use client"
import type React from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, ShoppingCart, Star, Zap, Plus, Minus, CheckCircle2 } from "lucide-react"
import { useState, useEffect } from "react"
import { Badge } from "./ui/badge"
import Link from "next/link"
import type { FoodItem } from "./providers/menu-provider"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "./ui/use-toast"
import { useOrderSelection } from "./providers/order-selection-provider"
import { useAuth } from "./providers/auth-provider"

// ── Real API hooks ────────────────────────────────────────────────────────────
import { useAddToCart, useToggleWishlist, useGetWishlist } from "@/src/hooks/useUser"
interface ProductCardProps {
  product: FoodItem
  featured?: boolean
}


export function ProductCard({ product, featured = false }: ProductCardProps) {
  const { isAuthenticated,user } = useAuth()
  const {
    _id,
    name,
    description,
    image,
    price,
    discountPercent,
    discountedPrice,
    type,
    categoryId,
    rating,
    isBestSeller,
    restaurantId,
  } = product

  const hasDiscount = (discountPercent ?? 0) > 0

   
  const { toast } = useToast()
  const { selectedItems, toggleSelect, updateQty, isSelected } = useOrderSelection()
  
  // ── Wishlist — only fetch when logged in (prevents 401 redirect for guests) ─
  const { data: wishlistData, refetch } = useGetWishlist({ enabled: isAuthenticated })

  const isProductFavorite: boolean = Boolean(
    wishlistData?.data?.some((item: any) => item._id === _id || item === _id)
  )

  // ── Real API mutations ─────────────────────────────────────────────────────
  const { mutate: addToCartMutate, isPending: isAddingToCart } = useAddToCart({
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: `${name} has been added to your cart.`,
        duration: 2000,
      })
    },
    onError: () => {
      toast({
        title: "Failed to add",
        description: "Could not add item to cart. Please try again.",
        variant: "destructive",
        duration: 2000,
      })
    },
  })

  const { mutate: toggleWishlistMutate, isPending: isTogglingWishlist } = useToggleWishlist({
    onSuccess: async(data) => {
      const action = data?.data?.action
       
        
      toast({
        title: action === "added" ? "Added to favourites" : "Removed from favourites",
        description:
          action === "added" ? `${name} added.` : `${name} removed.`,
        duration: 2000,
      })
      await refetch()
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Could not update favourites. Please try again.",
        variant: "destructive",
        duration: 2000,
      })
    },
  })

  // ── Derived values ─────────────────────────────────────────────────────────
  const finalPrice  = discountedPrice ?? price
  const avgRating   = rating?.averageRating ?? 5
  const selected    = isSelected(_id)
  const selectedQty = selectedItems.find((i) => i.id === _id)?.quantity ?? 1

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please login to add items to cart.", duration: 2000 })
      return
    }

    addToCartMutate({ menuItemId: _id, quantity: 1 })
  }

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast({ title: "Login required", description: "Please login to save favourites.", duration: 2000 })
      return
    }
    toggleWishlistMutate({ menuItemId: _id })
  }

  const handleToggleSelect = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleSelect({ id: _id, title: name, price: finalPrice, image, type, restaurantId: restaurantId ?? "" })
  }






  const handleQtyChange = (e: React.MouseEvent, delta: number) => {
    e.preventDefault()
    e.stopPropagation()
    updateQty(_id, Math.max(1, selectedQty + delta))
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <Link href={`/product/${_id}`}>
      <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
        <Card
          className={`overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col group
            ${
              selected
                ? "border-2 border-brand-primary shadow-lg shadow-brand-primary/10"
                : "border-transparent hover:border-brand-primary/20"
            }`}
        >
          {/* ── Image ──────────────────────────────────────────────────────── */}
          <div className="relative">
            <img
              src={image || "/placeholder.svg?height=200&width=300"}
              alt={name}
              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg?height=200&width=300"
              }}
            />

            {/* Discount badge */}
            {hasDiscount && (
              <Badge className="absolute top-2 left-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold">
                {discountPercent}% Off
              </Badge>
            )}

            {/* Favourite button */}
            <Button
              variant="ghost"
              size="icon"
              disabled={isTogglingWishlist}
              className={`absolute top-2 right-2 rounded-full bg-white/90 hover:bg-white shadow-md
                ${isProductFavorite ? "text-red-500" : "text-gray-500"}`}
              onClick={handleToggleFavorite}
            >
              <Heart className={`h-5 w-5 ${isProductFavorite ? "fill-current" : ""}`} />
            </Button>

            {/* "Selected" pill */}
            <AnimatePresence>
              {selected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="absolute bottom-2 left-2"
                >
                  <span className="flex items-center gap-1 bg-brand-primary text-white text-xs font-semibold px-2 py-1 rounded-full shadow">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Selected
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Featured badge */}
            {featured && !selected && (
              <Badge className="absolute bottom-2 left-2 bg-gradient-to-r from-brand-primary to-brand-secondary text-white">
                Featured
              </Badge>
            )}

            {/* Best Seller badge */}
            {isBestSeller && (
              <Badge className="absolute bottom-2 right-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                ⭐ Best Seller
              </Badge>
            )}
          </div>

          {/* ── Content ────────────────────────────────────────────────────── */}
          <div className="p-4 flex-1 flex flex-col bg-gradient-to-b from-white to-gray-50">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xl font-satisfy line-clamp-2 flex-1 bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                {description || name}
              </p>
              <div
                className={`flex items-center gap-1 ml-2 flex-shrink-0 ${
                  type === "Veg" ? "text-green-600" : "text-red-600"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${type === "Veg" ? "bg-green-600" : "bg-red-600"}`} />
                <span className="text-xs">{type}</span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                  }`}
                />
              ))}
              <span className="text-xs ml-1 text-gray-500">({rating?.ratingCount ?? 0})</span>
            </div>

            <div className="mt-auto">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl font-bold bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
                  ₹{finalPrice.toFixed(2)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-gray-400 line-through">₹{price.toFixed(2)}</span>
                )}
              </div>

              {/* Quantity row — slides in when item is selected */}
              <AnimatePresence>
                {selected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center justify-between bg-brand-primary/5 border border-brand-primary/20 rounded-lg px-3 py-1.5">
                      <span className="text-xs font-medium text-brand-primary">Qty</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleQtyChange(e, -1)}
                          className="w-6 h-6 rounded-full bg-white border border-brand-primary/30 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-bold text-brand-primary w-5 text-center">
                          {selectedQty}
                        </span>
                        <button
                          onClick={(e) => handleQtyChange(e, +1)}
                          className="w-6 h-6 rounded-full bg-white border border-brand-primary/30 flex items-center justify-center hover:bg-brand-primary hover:text-white transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-xs font-semibold text-gray-600">
                        ₹{(finalPrice * selectedQty).toFixed(0)}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Order Now toggle + Add to Cart */}
              <div className="flex gap-2">
                <Button
                  className={`flex-[7] transition-all
                    ${
                      selected
                        ? "bg-brand-primary text-white hover:bg-brand-primary/90"
                        : "bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
                    }`}
                  onClick={handleToggleSelect}
                >
                  {selected ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" /> Selected
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" /> Order Now
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  disabled={isAddingToCart}
                  className="flex-[3] border-brand-primary/30 hover:bg-brand-primary/5 hover:border-brand-primary text-brand-primary"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  )
}