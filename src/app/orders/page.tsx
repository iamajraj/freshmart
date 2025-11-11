"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Package, Eye, ShoppingBag } from "lucide-react"
import { toast } from "sonner"

interface OrderItem {
  id: string
  quantity: number
  price: number
  product: {
    name: string
  }
}

interface Order {
  id: string
  status: string
  totalAmount: number
  createdAt: string
  orderItems: OrderItem[]
}

const statusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  PROCESSING: { label: "Processing", color: "bg-orange-100 text-orange-800" },
  SHIPPED: { label: "Shipped", color: "bg-purple-100 text-purple-800" },
  DELIVERED: { label: "Delivered", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-800" },
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders")
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      } else if (response.status === 401) {
        toast.error("Please sign in to view your orders")
      } else {
        toast.error("Failed to load orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast.error("Failed to load orders")
    } finally {
      setLoading(false)
    }
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

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't placed any orders yet. Start shopping to see your orders here!
            </p>
            <Button asChild>
              <Link href="/products">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Start Shopping
              </Link>
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
          <h1 className="text-3xl font-bold">My Orders</h1>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {orders.map((order) => {
            const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING
            const itemCount = order.orderItems.reduce((sum, item) => sum + item.quantity, 0)

            return (
              <Card key={order.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold">
                          Order #{order.id.slice(-8)}
                        </h3>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">
                        Ordered on {new Date(order.createdAt).toLocaleDateString()} •{" "}
                        {itemCount} item{itemCount !== 1 ? "s" : ""}
                      </p>
                      <div className="text-sm text-gray-600">
                        {order.orderItems.slice(0, 3).map((item, index) => (
                          <span key={item.id}>
                            {item.product.name}
                            {item.quantity > 1 && ` (${item.quantity})`}
                            {index < order.orderItems.slice(0, 3).length - 1 && ", "}
                          </span>
                        ))}
                        {order.orderItems.length > 3 && ` and ${order.orderItems.length - 3} more...`}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-semibold mb-2">
                        ${order.totalAmount.toFixed(2)}
                      </p>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/orders/${order.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
