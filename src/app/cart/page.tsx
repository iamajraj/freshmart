"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

interface CartItem {
  id: string
  quantity: number
  product: {
    id: string
    name: string
    price: number
    image: string | null
    stock: number
    unit: string
    category: {
      name: string
    }
  }
}

interface CartResponse {
  items: CartItem[]
  total: number
  itemCount: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchCart()
  }, [])

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart")
      if (response.ok) {
        const data = await response.json()
        setCart(data)
      } else if (response.status === 401) {
        toast.error("Please sign in to view your cart")
        router.push("/auth/signin")
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error)
      toast.error("Failed to load cart")
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity: newQuantity }),
      })

      if (response.ok) {
        fetchCart() // Refresh cart
      } else {
        const data = await response.json()
        toast.error(data.message || "Failed to update quantity")
      }
    } catch (error) {
      toast.error("Failed to update quantity")
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Item removed from cart")
        fetchCart() // Refresh cart
      } else {
        toast.error("Failed to remove item")
      }
    } catch (error) {
      toast.error("Failed to remove item")
    }
  }

  const clearCart = async () => {
    if (!cart?.items.length) return

    try {
      await Promise.all(
        cart.items.map(item =>
          fetch(`/api/cart/${item.id}`, { method: "DELETE" })
        )
      )
      toast.success("Cart cleared")
      fetchCart()
    } catch (error) {
      toast.error("Failed to clear cart")
    }
  }

  const proceedToCheckout = () => {
    if (!cart?.items.length) {
      toast.error("Your cart is empty")
      return
    }
    router.push("/checkout")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Add some delicious groceries to get started!</p>
            <Button asChild>
              <Link href="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link href={`/products/${item.product.id}`}>
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.product.image ? (
                          <Image
                            src={item.product.image}
                            alt={item.product.name}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🛒
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Product Details */}
                    <div className="flex-1">
                      <Link href={`/products/${item.product.id}`}>
                        <h3 className="font-semibold text-lg hover:text-primary">
                          {item.product.name}
                        </h3>
                      </Link>
                      <p className="text-gray-600 text-sm mb-2">
                        {item.product.category.name}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <span className="text-gray-600">
                          ${item.product.price} per {item.product.unit}
                        </span>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Remove Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Items ({cart.itemCount})</span>
                  <span>${cart.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className={cart.total >= 50 ? "text-green-600" : ""}>
                    {cart.total >= 50 ? "$0.00" : "$5.99"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>${(cart.total * 0.08).toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${(cart.total + (cart.total * 0.08) + (cart.total >= 50 ? 0 : 5.99)).toFixed(2)}</span>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={proceedToCheckout}
                >
                  Proceed to Checkout
                </Button>

                {cart.total < 50 ? (
                  <p className="text-sm text-gray-600 text-center">
                    Add ${(50 - cart.total).toFixed(2)} more for free shipping!
                  </p>
                ) : (
                  <p className="text-sm text-green-600 text-center">
                    🎉 Free shipping on orders over $50!
                  </p>
                )}

                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <Link href="/products">Continue Shopping</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
