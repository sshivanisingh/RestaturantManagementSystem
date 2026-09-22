"use client"

import { ProductGrid }      from "@/components/product-grid"
import { CategoryFilter }   from "@/components/category-filter"
import { HeroSection }      from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import Navbar               from "@/components/Navbar/navbar"
import { FloatingOrderBar } from "@/components/floatingorderbar"
import { motion }           from "framer-motion"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <div className="">
        <Navbar />
        <main className="overflow-auto">
          <HeroSection />
          <div className="container mx-auto px-4 py-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-6"
            >
              Discover Our Menu
            </motion.h1>
            <CategoryFilter />
            <ProductGrid />
          </div>
          <FeaturedProducts />
        </main>
      </div>

      {/* Floating bar — appears at bottom when items are selected */}
      <FloatingOrderBar />
    </div>
  )
}