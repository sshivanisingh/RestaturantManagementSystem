"use client"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Filter, SearchIcon, SlidersHorizontal } from "lucide-react"
import { useState, useEffect, useMemo, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"
import { useGetAllCategories, useGetAllItems } from "@/src/hooks"

// ─── Types ────────────────────────────────────────────────────────────────────
type MenuItem = {
  _id: string
  name: string
  description?: string
  price: number
  discount?: number
  category: string | { _id: string; name: string }
  type?: "Veg" | "Non Veg"
  image?: string
  [key: string]: unknown
}

type Category = {
  _id: string
  name: string
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────
interface FilterPanelProps {
  categoryFilter   : string
  setCategoryFilter: (v: string) => void
  typeFilter       : string
  setTypeFilter    : (v: string) => void
  priceRange       : number[]
  setPriceRange    : (v: number[]) => void
  maxPrice         : number
  categories       : Category[]
  clearFilters     : () => void
}

function FilterPanel({
  categoryFilter, setCategoryFilter,
  typeFilter, setTypeFilter,
  priceRange, setPriceRange,
  maxPrice, categories, clearFilters,
}: FilterPanelProps) {
  return (
    <div className="space-y-6">
      {/* Category */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Category</h3>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat._id} value={cat._id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Type</h3>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Veg">Vegetarian</SelectItem>
            <SelectItem value="Non Veg">Non-Vegetarian</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-4">
        <div className="flex justify-between">
          <h3 className="text-sm font-medium">Price Range</h3>
          <span className="text-sm text-gray-500">
            ₹{priceRange[0]} – ₹{priceRange[1]}
          </span>
        </div>
        <Slider
          min={0}
          max={maxPrice}
          step={10}
          value={priceRange}
          onValueChange={setPriceRange}
        />
      </div>

      <Button variant="outline" className="w-full" onClick={clearFilters}>
        Clear Filters
      </Button>
    </div>
  )
}

// ─── SearchContent ────────────────────────────────────────────────────────────
function SearchContent() {
  const searchParams = useSearchParams()
  const router       = useRouter()
  const query        = searchParams.get("q") || ""

  const [searchQuery,   setSearchQuery]   = useState(query)
  const [sortBy,        setSortBy]        = useState("relevance")
  const [categoryFilter,setCategoryFilter]= useState("all")
  const [typeFilter,    setTypeFilter]    = useState("all")
  const [priceRange,    setPriceRange]    = useState([0, 1000])
  const [currentPage,   setCurrentPage]   = useState(1)
  const itemsPerPage = 12

  // ✅ API calls
  const { data: categoryData, isLoading: catLoading } = useGetAllCategories()
  const { data: menuData,     isLoading: menuLoading } = useGetAllItems()

  const categories: Category[] = categoryData?.data ?? []
  const allItems:   MenuItem[] = (menuData?.data as any[]) ?? []

  // ✅ Client-side filtering + sorting on API data
  const allResults = useMemo(() => {
    let filtered = [...allItems]

    // Search query
    if (query) {
      filtered = filtered.filter((item) => {
        const catName = typeof item.category === "object"
          ? item.category?.name
          : item.category
        return (
          item.name?.toLowerCase().includes(query.toLowerCase()) ||
          catName?.toLowerCase().includes(query.toLowerCase()) ||
          item.type?.toLowerCase().includes(query.toLowerCase())
        )
      })
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => {
        const catId = typeof item.category === "object"
          ? item.category?._id
          : item.category
        return catId === categoryFilter
      })
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter)
    }

    // Price filter
    filtered = filtered.filter((item) => {
      const finalPrice = item.discount
        ? item.price - (item.price * item.discount) / 100
        : item.price
      return finalPrice >= priceRange[0] && finalPrice <= priceRange[1]
    })

    // Sort
    if (sortBy === "price-low") {
      filtered.sort((a, b) => {
        const pa = a.discount ? a.price - (a.price * a.discount) / 100 : a.price
        const pb = b.discount ? b.price - (b.price * b.discount) / 100 : b.price
        return pa - pb
      })
    } else if (sortBy === "price-high") {
      filtered.sort((a, b) => {
        const pa = a.discount ? a.price - (a.price * a.discount) / 100 : a.price
        const pb = b.discount ? b.price - (b.price * b.discount) / 100 : b.price
        return pb - pa
      })
    } else if (sortBy === "discount") {
      filtered.sort((a, b) => (b.discount || 0) - (a.discount || 0))
    }

    return filtered
  }, [allItems, query, categoryFilter, typeFilter, priceRange, sortBy])

  // Calculate pagination
  const totalPages = Math.ceil(allResults.length / itemsPerPage)
  const searchResults = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    const end = start + itemsPerPage
    return allResults.slice(start, end)
  }, [allResults, currentPage])

  // ✅ Max price from API data
  const maxPrice = useMemo(() => {
    if (!allItems.length) return 1000
    return Math.ceil(Math.max(...allItems.map((i) => i.price)))
  }, [allItems])

  // Sync max price when data loads
  useEffect(() => {
    setPriceRange([0, maxPrice])
  }, [maxPrice])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const url = new URL(window.location.href)
    url.searchParams.set("q", searchQuery)
    router.push(url.pathname + url.search)
  }

  const clearFilters = () => {
    setCategoryFilter("all")
    setTypeFilter("all")
    setPriceRange([0, maxPrice])
    setSortBy("relevance")
    setCurrentPage(1)
  }

  const activeFiltersCount =
    (categoryFilter !== "all" ? 1 : 0) +
    (typeFilter     !== "all" ? 1 : 0) +
    (sortBy         !== "relevance" ? 1 : 0) +
    (priceRange[0] > 0 || priceRange[1] < maxPrice ? 1 : 0)

  const isLoading = catLoading || menuLoading

  return (
    <div className="bg-gradient-to-br from-orange-50 to-pink-50 min-h-full">
      <div className="container mx-auto px-4 py-8">

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-4xl font-satisfy bg-gradient-to-r from-brand-primary to-purple-600 bg-clip-text text-transparent mb-2">
              Search Results
            </h1>
            {query && (
              <p className="text-gray-600">
                Showing results for{" "}
                <span className="font-medium">"{query}"</span>
              </p>
            )}
          </motion.div>

          <div className="flex flex-col lg:flex-row gap-6">

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <Badge className="ml-2 bg-brand-primary">{activeFiltersCount}</Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your search results</SheetDescription>
                  </SheetHeader>
                  <div className="py-4">
                    <FilterPanel
                      categoryFilter={categoryFilter}    setCategoryFilter={setCategoryFilter}
                      typeFilter={typeFilter}            setTypeFilter={setTypeFilter}
                      priceRange={priceRange}            setPriceRange={setPriceRange}
                      maxPrice={maxPrice}                categories={categories}
                      clearFilters={clearFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:block w-64 bg-white p-6 rounded-xl shadow-md h-fit sticky top-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-medium">Filters</h2>
                <Button
                  variant="ghost" size="sm"
                  onClick={clearFilters}
                  className="text-sm text-brand-primary"
                >
                  Clear All
                </Button>
              </div>
              <FilterPanel
                categoryFilter={categoryFilter}    setCategoryFilter={setCategoryFilter}
                typeFilter={typeFilter}            setTypeFilter={setTypeFilter}
                priceRange={priceRange}            setPriceRange={setPriceRange}
                maxPrice={maxPrice}                categories={categories}
                clearFilters={clearFilters}
              />
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Search + Sort bar */}
              <div className="bg-white p-4 rounded-xl shadow-md mb-6">
                <form onSubmit={handleSearch} className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      type="text"
                      placeholder="Search items..."
                      className="pl-9"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="bg-brand-primary hover:bg-brand-primary/90">
                    Search
                  </Button>
                </form>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {isLoading
                      ? "Loading..."
                      : `${allResults.length} ${allResults.length === 1 ? "result" : "results"} found${totalPages > 1 ? ` • Page ${currentPage} of ${totalPages}` : ""}`}
                  </p>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-gray-500" />
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="discount">Highest Discount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Loading skeleton */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white rounded-xl h-64 animate-pulse" />
                  ))}
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {searchResults.map((product, index) => (
                      <motion.div
                        key={product._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      >
                        <ProductCard product={product as any} />
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center items-center gap-2">
                      <Button
                        variant="outline"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      >
                        Previous
                      </Button>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                          <Button
                            key={page}
                            variant={currentPage === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page ? "bg-brand-primary" : ""}
                          >
                            {page}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>

              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white rounded-lg shadow-lg p-8 text-center border border-orange-100"
                >
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
                      <SearchIcon className="h-10 w-10 text-brand-primary" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-medium mb-2">No results found</h2>
                  <p className="text-gray-600 mb-6">
                    No items match your search criteria.
                  </p>
                  <Button
                    className="bg-gradient-to-r from-brand-primary to-orange-500 text-white"
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-pink-50">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}