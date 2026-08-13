"use client"
import React from 'react'
import { ProductGrid } from "@/components/product-grid"
import { CategoryFilter } from "@/components/category-filter"
import { FeaturedProducts } from "@/components/featured-products"
import { motion } from "framer-motion"  
import Navbar from '../Navbar/navbar' 
 

export const MenueItem = () => {
    

       
  return (
    <main>
     <Navbar/>
      <div className="container mx-auto px-4 py-8">
        <h1
          className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-6"
        >
          Discover Our Menu
        </h1>
        <CategoryFilter />
        <ProductGrid />
      </div>
      <FeaturedProducts />
    </main>
  )
}