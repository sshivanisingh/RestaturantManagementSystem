"use client"

import { ProductCard } from "./product-card"
import { useGetAllItems } from "@/src/hooks/useMenuItem"

interface RelatedProductsProps {
  currentProductId: string
  category: string
}

export function RelatedProducts({ currentProductId, category }: RelatedProductsProps) {
  const { data: itemsData, isLoading } = useGetAllItems()

  // Backend returns { items: [], pagination: {} } — not a flat array
  const raw   = itemsData?.data as any
  const items: any[] = (Array.isArray(raw) ? raw : raw?.items) ?? []

  if (isLoading) {
    return (
      <section className="mt-16">
        <div className="h-7 bg-gray-100 rounded w-40 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-4/5" />
                <div className="h-9 bg-gray-200 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
    )
  }

  const others = items.filter((p: any) => p._id !== currentProductId)

  // same category first, then fill with anything else up to 4
  const sameCategory = others.filter((p: any) => p.categoryId?.name === category)
  const different    = others.filter((p: any) => p.categoryId?.name !== category)
  const relatedProducts = [...sameCategory, ...different].slice(0, 4)

  if (relatedProducts.length === 0) return null

  return (
    <section className="mt-16">
      <h2 className="text-2xl font-satisfy text-brand-primary mb-6">You May Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((product: any) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  )
}
