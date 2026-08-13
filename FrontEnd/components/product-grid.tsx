
"use client"

import { useMenu } from "./providers/menu-provider"
import { motion } from "framer-motion"
import { ProductCard } from "./product-card"

export function ProductGrid() {
  const { filteredItems, isLoading } = useMenu()

  console.log("filteredItems",filteredItems);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
            {/* image */}
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-gray-200" />
            </div>
            {/* content */}
            <div className="p-4 space-y-3">
              {/* name + veg */}
              <div className="flex justify-between items-start gap-2">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-4 bg-gray-100 rounded w-10 flex-shrink-0" />
              </div>
              {/* description */}
              <div className="space-y-1.5">
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
              </div>
              {/* stars */}
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, s) => (
                  <div key={s} className="w-4 h-4 rounded bg-gray-200" />
                ))}
                <div className="h-3 bg-gray-100 rounded w-8 ml-1" />
              </div>
              {/* price + category */}
              <div className="flex justify-between items-center pt-1">
                <div className="h-5 bg-gray-200 rounded w-20" />
                <div className="h-5 bg-gray-100 rounded-full w-16" />
              </div>
              {/* button */}
              <div className="h-9 bg-gradient-to-r from-gray-200 to-gray-200 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div id="menu" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
      {filteredItems?.map((product, index) => (
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
        >
        
          <ProductCard product={product} />
        </motion.div>
      ))}

      {(filteredItems?.length ?? 0) === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400"
        >
          <span className="text-6xl mb-4">🍽️</span>
          <h3 className="text-xl font-medium mb-1">No items found</h3>
          <p className="text-sm">Try adjusting your search or category filter</p>
        </motion.div>
      )}
    </div>
  )
}

