"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
 

import { useGetAllCategories } from "@/src/hooks/useMenuCategory"
import {useGetAllItems} from "@/src/hooks/useMenuItem"


 

// ─── Types ────────────────────────────────────────────────────────────────────

export type FoodItem = {
  _id: string
  name: string
  description: string
  image: string
  price: number
  discountPercent?: number
  discountedPrice?: number
  type: string
  categoryId: { _id: string; name: string }
  isActive: boolean
  isAvailable: boolean
  isBestSeller: boolean
  rating?: { averageRating: number; ratingCount: number }
  preparationTime?: number
  restaurantId?: string
}

export type Category = {
  _id: string
  name: string
  icon: string
  isActive: boolean
  sortOrder: number
}

type MenuContextType = {
  items: FoodItem[]
  filteredItems: FoodItem[]
  categories: Category[]
  searchQuery: string
  setSearchQuery: (q: string) => void
  selectedCategory: string   // "all" or category _id
  setSelectedCategory: (id: string) => void
  isLoading: boolean
}

export const MenuContext = createContext<MenuContextType | undefined>(undefined)

// ─── Provider ─────────────────────────────────────────────────────────────────

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery]       = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all") 

  // API calls
  const { data: categoriesData, isLoading: catLoading } = useGetAllCategories()
  const { data: itemsData,       isLoading: itemLoading } = useGetAllItems({})

  const categories: Category[] = (categoriesData?.data as any[]) ?? []
  const items: FoodItem[]      = (itemsData?.data as any)?.items ?? []


   console.log("items",items);
  // ── Filter logic ────────────────────────────────────────────────────────────
  const filteredItems = items?.filter((item:any) => {
    // Category filter
    const categoryMatch =
      selectedCategory === "all" ||
      item.categoryId?._id === selectedCategory

    // Search filter
    const searchMatch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchQuery.toLowerCase())

    return categoryMatch && searchMatch
  })

  return (
    <MenuContext.Provider
      value={{
        items,
        filteredItems,
        categories,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        isLoading: catLoading || itemLoading,
      }}
    >
      {children}
    </MenuContext.Provider>
  )
}

export const useMenu = () => {
  const context = useContext(MenuContext)
  if (!context) throw new Error("useMenu must be used within a MenuProvider")
  return context
}