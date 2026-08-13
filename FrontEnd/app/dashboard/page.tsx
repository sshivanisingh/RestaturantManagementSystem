"use client"

import { SidebarNav } from "@/components/sidebar-nav"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { CategoryFilter } from "@/components/category-filter"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProducts } from "@/components/featured-products"
import { motion } from "framer-motion"


export default function HomePage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-orange-50 to-pink-50">
      <SidebarNav />
      <div className="flex-1 flex flex-col overflow-hidden md:ml-64">
        <Header />
        <main className="flex-1 overflow-auto">
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
    </div>
  )
}

