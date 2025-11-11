"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Footer } from "@/components/footer"

interface Category {
  id: string
  name: string
  description: string | null
  image: string | null
  _count: {
    products: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Shop by Category</h1>
          <p className="text-gray-600">
            Browse our wide selection of grocery categories to find exactly what you need
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link key={category.id} href={`/products?category=${category.id}`}>
              <Card className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                <CardContent className="p-6 text-center h-full flex flex-col">
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-linear-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mb-4 text-3xl">
                      {category.image ? (
                        // right now I'mm not uploading any images, so using emoji instead
                        // <img
                        //   src={category.image}
                        //   alt={category.name}
                        //   className="w-12 h-12 object-contain"
                        // />
                        <span>{category.image}</span>
                      ) : (
                        <span>🛒</span>
                      )}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto">
                    <Badge variant="secondary" className="text-sm">
                      {category._count.products} products
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No categories available</h3>
            <p className="text-gray-600">Check back later for new categories!</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}
