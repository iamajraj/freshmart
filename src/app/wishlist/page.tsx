"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, ShoppingCart, Star, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface WishlistItem {
  id: string
  product: {
    id: string
    name: string
    description: string | null
    price: number
    image: string | null
    stock: number
    unit: string
    category: {
      name: string
    }
    _count: {
      reviews: number
      wishlists: number
    }
  }
}

export default function WishlistPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchWishlist()
  }, [session, status, router])

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/wishlist")
      if (response.ok) {
        const data = await response.json()
        setWishlistItems(data)
      } else {
        toast.error("Failed to load wishlist")
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error)
      toast.error("Failed to load wishlist")
    } finally {
      setLoading(false)
    }
  }

  const removeFromWishlist = async (wishlistId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${wishlistId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setWishlistItems(prev => prev.filter(item => item.id !== wishlistId))
        toast.success("Removed from wishlist")
      } else {
        toast.error("Failed to remove from wishlist")
      }
    } catch (error) {
      console.error("Failed to remove from wishlist:", error)
      toast.error("Failed to remove from wishlist")
    }
  }

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          quantity,
        }),
      })

      if (response.ok) {
        toast.success("Added to cart!")
      } else {
        toast.error("Failed to add to cart")
      }
    } catch (error) {
      console.error("Failed to add to cart:", error)
      toast.error("Failed to add to cart")
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-lg shadow">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-gray-600">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
          </p>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6">
              Save items you love for later by clicking the heart icon on products.
            </p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow pb-6 pt-0">
                <CardContent className="p-0">
                  <Link href={`/products/${item.product.id}`}>
                    <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden relative">
                      {item.product.image ? (
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl">
                          🛒
                        </div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                        onClick={(e) => {
                          e.preventDefault()
                          removeFromWishlist(item.id)
                        }}
                      >
                        <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </Link>

                  <div className="p-4">
                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-semibold mb-1 hover:text-primary line-clamp-2">
                        {item.product.name}
                      </h3>
                    </Link>

                    <p className="text-sm text-gray-600 mb-2">
                      {item.product.category.name}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-primary">
                        ${item.product.price.toFixed(2)}
                      </span>
                      <span className="text-sm text-gray-600">
                        per {item.product.unit}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">
                          {item.product._count.reviews} reviews
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        variant={item.product.stock > 0 ? "secondary" : "destructive"}
                        className={item.product.stock > 0 ? "bg-green-100 text-green-800" : ""}
                      >
                        {item.product.stock > 0 ? `In Stock (${item.product.stock})` : "Out of Stock"}
                      </Badge>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={item.product.stock === 0}
                          onClick={() => addToCart(item.product.id)}
                        >
                          <ShoppingCart className="w-4 h-4 mr-1" />
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
