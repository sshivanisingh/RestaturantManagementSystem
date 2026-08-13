"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
 

export function HeroSection() {

 

  return (
    <div className="relative bg-gradient-to-r from-orange-100 to-pink-100 py-16 md:py-24 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-yellow-300/20 to-orange-500/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-pink-300/20 to-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mb-8 md:mb-0"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-4 leading-tight">
            Delicious Food Delivered To Your Door
          </h1>
          <p className="text-lg mb-8 text-gray-700 max-w-md">
            Enjoy our restaurant-quality meals from the comfort of your home. Order online for fast delivery or pickup.
          </p>
          <div className="flex gap-4">
            <Button
              className="bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white"
              size="lg"
              asChild
            >
              <Link href="#menu">Order Now</Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-brand-primary text-brand-primary hover:bg-brand-primary/10"
              asChild
            >
              <Link href="/reservation">Book a Table</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 flex justify-center"
        >
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-brand-accent rounded-full opacity-20 animate-pulse"></div>
            <motion.img
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
              src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2070&auto=format&fit=crop"
              alt="Delicious Food"
              className="rounded-2xl shadow-2xl relative z-10 max-w-full h-auto"
            />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-brand-secondary rounded-full opacity-20 animate-pulse"></div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

