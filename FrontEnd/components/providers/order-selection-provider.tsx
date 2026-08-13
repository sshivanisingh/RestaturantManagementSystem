"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
export interface SelectedItem {
  id      : string
  title   : string
  price   : number
  image   : string
  type    : string
  quantity: number
  restaurantId: string
}

interface OrderSelectionContextValue {
  selectedItems : SelectedItem[]
  isSelected    : (id: string) => boolean
  toggleSelect  : (item: Omit<SelectedItem, "quantity">) => void
  updateQty     : (id: string, qty: number) => void
  clearSelection: () => void
  totalItems    : number
  totalPrice    : number
}

const OrderSelectionContext = createContext<OrderSelectionContextValue | null>(null)

export function OrderSelectionProvider({ children }: { children: ReactNode }) {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])

  const isSelected = useCallback(
    (id: string) => selectedItems.some((i) => i.id === id),
    [selectedItems]
  )

  const toggleSelect = useCallback((item: Omit<SelectedItem, "quantity">) => {
    setSelectedItems((prev) => {
      const exists = prev.find((i) => i.id === item.id)
      return exists
        ? prev.filter((i) => i.id !== item.id)
        : [...prev, { ...item, quantity: 1 }]
    })
  }, [])

  const updateQty = useCallback((id: string, qty: number) => {
    setSelectedItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
    )
  }, [])

  const clearSelection = useCallback(() => setSelectedItems([]), [])

  const totalItems = selectedItems.reduce((s, i) => s + i.quantity, 0)
  const totalPrice = selectedItems.reduce((s, i) => s + i.price * i.quantity, 0)

  return (
    <OrderSelectionContext.Provider
      value={{ selectedItems, isSelected, toggleSelect, updateQty, clearSelection, totalItems, totalPrice }}
    >
      {children}
    </OrderSelectionContext.Provider>
  )
}

export function useOrderSelection() {
  const ctx = useContext(OrderSelectionContext)
  if (!ctx) throw new Error("useOrderSelection must be used inside OrderSelectionProvider")
  return ctx
}