 
"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "./product-card"
import { useMenu } from "./providers/menu-provider"

export function FeaturedProducts() {
  const { items, isLoading } = useMenu()
  
  console.log("items12",items);
  
  // items from useMenu context is the raw paginated object { items:[], pagination:{} }
  const itemsArr = (Array.isArray(items) ? items : (items as any)?.items) ?? []
  const featuredProducts = itemsArr.filter((p: any) => p.isBestSeller || p.isActive).slice(0, 4)
     

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-br from-white to-orange-50">
        <div className="container mx-auto px-4">
          <div className="h-8 bg-gray-100 rounded w-48 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="h-48 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-3/4" />
                  <div className="h-8 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!featuredProducts?.length) return null

  return (
    <section className="py-16 bg-gradient-to-br from-white to-orange-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-8"
        >
          <h2 className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent">
            Featured Dishes
          </h2>
          <Button
            variant="outline"
            className="border-brand-primary text-brand-primary hover:bg-brand-primary/10 group"
            asChild
          >
            <Link href="/#menu" className="flex items-center">
              View All
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product: any, index: number) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} featured />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}