"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"
import { useCart } from "./providers/cart-provider"
import { toast } from "react-hot-toast"

interface FoodCardProps {
  id: string
  image: string
  title: string
  price: number
  discount?: number
  type: "Veg" | "Non Veg"
  category: string
}

export function FoodCard({ id, image, title, price, discount, type, category }: FoodCardProps) {
  const { items, addToCart, updateQuantity } = useCart()
  const cartItem = items.find((item) => item.id === id)
  const quantity = cartItem?.quantity || 0

  const handleAddToCart = () => {
    addToCart({
      id,
      title,
      price,
      image,
      type,
    })

    // Show toast notification
    toast.success(`${title} has been added to your cart.`)
  }

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(id, quantity - 1)
    }
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={image || "/placeholder.svg?height=160&width=320"}
          alt={title}
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg?height=160&width=320"
          }}
        />
        {discount && (
          <div className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-medium">
            {discount}% Off
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium mb-1 line-clamp-2 h-10">{title}</h3>
        <div className="flex justify-between items-center mb-2">
          <span className="text-green-600 font-bold">${price.toFixed(2)}</span>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${type === "Veg" ? "bg-green-500" : "bg-red-500"}`}></span>
            <span className="text-xs text-gray-500">{type}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          {quantity === 0 ? (
            <Button variant="default" className="w-full bg-green-600 hover:bg-green-700" onClick={handleAddToCart}>
              Add to Cart
            </Button>
          ) : (
            <>
              <Button variant="outline" size="icon" className="rounded-full" onClick={handleDecrement}>
                <Minus className="h-4 w-4" />
              </Button>
              <span className="font-medium">{quantity}</span>
              <Button variant="outline" size="icon" className="rounded-full" onClick={handleIncrement}>
                <Plus className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  )
}

