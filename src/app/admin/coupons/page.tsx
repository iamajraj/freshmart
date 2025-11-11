"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit, Eye, Trash2, Tag } from "lucide-react"
import { toast } from "sonner"

interface Coupon {
  id: string
  code: string
  description: string
  discountType: string
  discountValue: number | null
  minPurchase: number | null
  maxDiscount: number | null
  isActive: boolean
  usageLimit: number | null
  usageLimitPerUser: number | null
  usageCount: number
  startDate: string | null
  endDate: string | null
  createdAt: string
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discountType: "PERCENTAGE",
    discountValue: "",
    minPurchase: "",
    maxDiscount: "",
    isActive: true,
    usageLimit: "",
    usageLimitPerUser: "",
    startDate: "",
    endDate: "",
  })

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      const response = await fetch("/api/admin/coupons")
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error)
      toast.error("Failed to load coupons")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : "/api/admin/coupons"
      const method = editingCoupon ? "PUT" : "POST"

      const submitData = {
        ...formData,
        discountValue: formData.discountValue ? parseFloat(formData.discountValue) : null,
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        toast.success(`Coupon ${editingCoupon ? "updated" : "created"} successfully`)
        fetchCoupons()
        setIsCreateOpen(false)
        setEditingCoupon(null)
        resetForm()
      } else {
        const data = await response.json()
        toast.error(data.message || "Failed to save coupon")
      }
    } catch (error) {
      console.error("Failed to save coupon:", error)
      toast.error("Failed to save coupon")
    }
  }

  const handleDelete = async (couponId: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return

    try {
      const response = await fetch(`/api/admin/coupons/${couponId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Coupon deleted successfully")
        fetchCoupons()
      } else {
        const data = await response.json()
        toast.error(data.message || "Failed to delete coupon")
      }
    } catch (error) {
      console.error("Failed to delete coupon:", error)
      toast.error("Failed to delete coupon")
    }
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue?.toString() || "",
      minPurchase: coupon.minPurchase?.toString() || "",
      maxDiscount: coupon.maxDiscount?.toString() || "",
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit?.toString() || "",
      usageLimitPerUser: coupon.usageLimitPerUser?.toString() || "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().slice(0, 16) : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().slice(0, 16) : "",
    })
    setIsCreateOpen(true)
  }

  const resetForm = () => {
    setFormData({
      code: "",
      description: "",
      discountType: "PERCENTAGE",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      isActive: true,
      usageLimit: "",
      usageLimitPerUser: "",
      startDate: "",
      endDate: "",
    })
  }

  const isCouponActive = (coupon: Coupon) => {
    if (!coupon.isActive) return false
    const now = new Date()
    if (coupon.startDate && new Date(coupon.startDate) > now) return false
    if (coupon.endDate && new Date(coupon.endDate) < now) return false
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return false
    return true
  }

  const getDiscountDescription = (coupon: Coupon) => {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}% off`
    } else if (coupon.discountType === "FIXED") {
      return `$${coupon.discountValue} off`
    } else if (coupon.discountType === "FREE_SHIPPING") {
      return "Free shipping"
    }
    return "Unknown discount"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Coupon Management</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingCoupon(null); resetForm(); }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="SUMMER2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select value={formData.discountType} onValueChange={(value) => setFormData({ ...formData, discountType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">Percentage Off</SelectItem>
                      <SelectItem value="FIXED">Fixed Amount Off</SelectItem>
                      <SelectItem value="FREE_SHIPPING">Free Shipping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Get 20% off your entire order!"
                  required
                />
              </div>

              {formData.discountType !== "FREE_SHIPPING" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountValue">
                      {formData.discountType === "PERCENTAGE" ? "Discount Percentage *" : "Discount Amount *"}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      step={formData.discountType === "PERCENTAGE" ? "1" : "0.01"}
                      value={formData.discountValue}
                      onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                      placeholder={formData.discountType === "PERCENTAGE" ? "20" : "10.00"}
                      required
                    />
                  </div>
                  {formData.discountType === "PERCENTAGE" && (
                    <div className="space-y-2">
                      <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        step="0.01"
                        value={formData.maxDiscount}
                        onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                        placeholder="50.00"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minPurchase">Minimum Purchase ($)</Label>
                  <Input
                    id="minPurchase"
                    type="number"
                    step="0.01"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="25.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimitPerUser">Usage Limit Per User</Label>
                <Input
                  id="usageLimitPerUser"
                  type="number"
                  value={formData.usageLimitPerUser}
                  onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                  placeholder="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setIsCreateOpen(false); setEditingCoupon(null); resetForm(); }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingCoupon ? "Update" : "Create"} Coupon
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Coupons</p>
                <p className="text-2xl font-bold">{coupons.length}</p>
              </div>
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {coupons.filter(c => isCouponActive(c)).length}
                </p>
              </div>
              <Tag className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Used</p>
                <p className="text-2xl font-bold text-blue-600">
                  {coupons.reduce((sum, c) => sum + c.usageCount, 0)}
                </p>
              </div>
              <Tag className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-600">
                  {coupons.filter(c => !c.isActive || (c.endDate && new Date(c.endDate) < new Date())).length}
                </p>
              </div>
              <Tag className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Coupons Table */}
      <Card>
        <CardHeader>
          <CardTitle>Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell>
                    <code className="bg-gray-100 px-2 py-1 rounded font-mono text-sm">
                      {coupon.code}
                    </code>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate" title={coupon.description}>
                      {coupon.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getDiscountDescription(coupon)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{coupon.usageCount} used</div>
                      {coupon.usageLimit && (
                        <div className="text-gray-500">of {coupon.usageLimit}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      isCouponActive(coupon)
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }>
                      {isCouponActive(coupon) ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.endDate
                      ? new Date(coupon.endDate).toLocaleDateString()
                      : "No expiry"
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coupon.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
