"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Settings,
  MessageSquare,
  Gift,
  Megaphone,
  Tag,
  Image,
  ArrowLeft
} from "lucide-react"

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Settings },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/redemptions", label: "Redemptions", icon: Gift },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/campaigns", label: "Campaigns", icon: Megaphone },
  { href: "/admin/banners", label: "Banners", icon: Image },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return

    if (!session || session.user.role !== "ADMIN") {
      router.push("/")
      return
    }
  }, [session, status, router])

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || session.user.role !== "ADMIN") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm min-h-[calc(100vh-64px)]">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <ArrowLeft className="h-5 w-5" />
              <Link href="/" className="font-semibold hover:text-primary">
                Back to Store
              </Link>
            </div>

            <nav className="space-y-2">
              {adminNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <div>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </div>
                    </Button>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
