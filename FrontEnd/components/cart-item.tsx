"use client"

import { Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "./providers/cart-provider"

interface CartItemProps {
  id: string
  title: string
  price: number
  quantity: number
  image: string
}

export function CartItem({ id, title, price, quantity, image }: CartItemProps) {
  const { updateQuantity, removeFromCart } = useCart()

  const handleIncrement = () => {
    updateQuantity(id, quantity + 1)
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(id, quantity - 1)
    } else {
      removeFromCart(id)
    }
  }

  return (
    <div className="flex items-center gap-3 mb-4 group">
      <img
        src={image || "/placeholder.svg?height=64&width=64"}
        alt={title}
        className="w-16 h-16 rounded-lg object-cover"
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg?height=64&width=64"
        }}
      />
      <div className="flex-1">
        <h4 className="text-sm font-medium mb-1 line-clamp-2">{title}</h4>
        <div className="flex justify-between items-center">
          <span className="text-green-600 font-bold">${price.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleDecrement}>
              {quantity === 1 ? <Trash2 className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            </Button>
            <span className="text-sm w-4 text-center">{quantity}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleIncrement}>
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

