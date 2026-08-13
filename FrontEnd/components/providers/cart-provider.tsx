"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

export type CartItem = {
  id: string
  title: string
  price: number
  quantity: number
  image: string
  type: "Veg" | "Non Veg"
}

type CartContextType = {
  items: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity">) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  subtotal: number
  tax: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  // Initialize state from localStorage
  const [items, setItems] = useState<CartItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedCart = localStorage.getItem("cart-items")
        return savedCart ? JSON.parse(savedCart) : []
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
        return []
      }
    }
    return []
  })

  const [subtotal, setSubtotal] = useState(0)
  const [tax, setTax] = useState(0)
  const [total, setTotal] = useState(0)

  // Save to localStorage whenever items change
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("cart-items", JSON.stringify(items))
        console.log("Cart saved to localStorage:", items)
      } catch (error) {
        console.error("Error saving cart to localStorage:", error)
      }
    }
  }, [items])

  // Calculate totals whenever items change
  useEffect(() => {
    const newSubtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    const newTax = newSubtotal * 0.05
    const newTotal = newSubtotal + newTax

    setSubtotal(newSubtotal)
    setTax(newTax)
    setTotal(newTotal)
  }, [items])

  const addToCart = (item: Omit<CartItem, "quantity">) => {
    setItems((prevItems) => {
      // Check if item already exists in cart
      const existingItemIndex = prevItems.findIndex((i) => i.id === item.id)

      let newItems
      if (existingItemIndex >= 0) {
        newItems = [...prevItems]
        newItems[existingItemIndex].quantity += 1
      } else {
        newItems = [...prevItems, { ...item, quantity: 1 }]
      }

      console.log("Updated cart items:", newItems)
      return newItems
    })
  }



  const removeFromCart = (id: string) => {
    setItems((prevItems) => {
      const newItems = prevItems.filter((item) => item.id !== id)
      console.log("After removing item:", newItems)
      return newItems
    })
  }



  const updateQuantity = (id: string, quantity: number) => {
    setItems((prevItems) => {
      let newItems
      if (quantity <= 0) {
        newItems = prevItems.filter((item) => item.id !== id)
      } else {
        newItems = prevItems.map((item) => (item.id === id ? { ...item, quantity } : item))
      }

      console.log("After updating quantity:", newItems)
      return newItems
    })
  }

  const clearCart = () => {
    setItems([])
    console.log("Cart cleared")
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        tax,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

