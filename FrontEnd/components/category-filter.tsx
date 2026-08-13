"use client"

import { useMenu } from "./providers/menu-provider"
import { motion } from "framer-motion"

export function CategoryFilter() {
  const { categories, items, selectedCategory, setSelectedCategory } = useMenu()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide"
    >
      {/* ── ALL button (default) ── */}
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSelectedCategory("all")}
        className={`flex flex-col items-center p-3 rounded-xl min-w-[100px] border-2 cursor-pointer
          hover:shadow-md transition-all duration-300
          ${selectedCategory === "all"
            ? "bg-gradient-to-br from-brand-primary/10 to-purple-500/10 text-brand-primary border-brand-primary"
            : "bg-white border-transparent"
          }`}
      >
        <div className={`p-2 rounded-full text-xl
          ${selectedCategory === "all"
            ? "bg-gradient-to-br from-brand-primary to-purple-500"
            : "bg-gray-100"
          }`}
        >
          🍽️
        </div>
        <span className="text-sm font-medium mt-2">All</span>
        <span className="text-xs text-gray-500">{items.length} Items</span>
      </motion.div>

      {/* ── API categories ── */}
      {categories.map((category, index) => {
        const isActive = category._id === selectedCategory

        // Count items in this category
        const count = (items as any[])?.filter((i:any) => i.categoryId?._id === category._id).length

        return (
          <motion.div
            key={category._id ?? index}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category._id)}
            className={`flex flex-col items-center p-3 rounded-xl min-w-[100px] border-2 cursor-pointer
              hover:shadow-md transition-all duration-300
              ${isActive
                ? "bg-gradient-to-br from-brand-primary/10 to-purple-500/10 text-brand-primary border-brand-primary"
                : "bg-white border-transparent"
              }`}
          >
            <div className={`p-2 rounded-full text-xl
              ${isActive
                ? "bg-gradient-to-br from-brand-primary to-purple-500"
                : "bg-gray-100"
              }`}
            >
              {/* ✅ API se aaya emoji — no Lucide, no crash */}
              {category.icon || "🍽️"}
            </div>
            <span className="text-sm font-medium mt-2 text-center">{category.name}</span>
            <span className="text-xs text-gray-500">{count} Items</span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}