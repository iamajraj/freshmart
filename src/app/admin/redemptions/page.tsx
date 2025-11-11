"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, XCircle, Clock, Eye, Gift } from "lucide-react"
import { toast } from "sonner"

interface Redemption {
  id: string
  status: string
  redeemedAt: string
  usedAt: string | null
  user: {
    id: string
    name: string | null
    email: string
  }
  reward: {
    id: string
    name: string
    description: string
    pointsCost: number
    type: string
    value: number
  }
}

const statusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800", icon: XCircle },
  USED: { label: "Used", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
}

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchRedemptions()
  }, [statusFilter])

  const fetchRedemptions = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.set("status", statusFilter)
      }

      const response = await fetch(`/api/admin/redemptions?${params}`)
      if (response.ok) {
        const data = await response.json()
        setRedemptions(data.redemptions)
      }
    } catch (error) {
      console.error("Failed to fetch redemptions:", error)
      toast.error("Failed to load redemptions")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (redemptionId: string, action: "approve" | "reject") => {
    setProcessing(redemptionId)
    try {
      const response = await fetch(`/api/admin/redemptions/${redemptionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      })

      if (response.ok) {
        toast.success(`Redemption ${action}d successfully`)
        fetchRedemptions()
      } else {
        const data = await response.json()
        toast.error(data.message || "Failed to update redemption")
      }
    } catch (error) {
      console.error("Failed to update redemption:", error)
      toast.error("Failed to update redemption")
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig]
    return (
      <Badge className={config?.color || "bg-gray-100 text-gray-800"}>
        {config?.icon && <config.icon className="w-3 h-3 mr-1" />}
        {config?.label || status}
      </Badge>
    )
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
        <h1 className="text-3xl font-bold">Redemption Management</h1>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="USED">Used</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold">{redemptions.length}</p>
              </div>
              <Gift className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {redemptions.filter(r => r.status === "PENDING").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {redemptions.filter(r => r.status === "APPROVED").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">
                  {redemptions.filter(r => r.status === "REJECTED").length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Redemptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Redemption Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Reward</TableHead>
                <TableHead>Points Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Redeemed At</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {redemptions.map((redemption) => (
                <TableRow key={redemption.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{redemption.user.name || "N/A"}</p>
                      <p className="text-sm text-gray-500">{redemption.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{redemption.reward.name}</p>
                      <p className="text-sm text-gray-500">{redemption.reward.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{redemption.reward.pointsCost} pts</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                  <TableCell>
                    {new Date(redemption.redeemedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRedemption(redemption)
                          setIsDetailsOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {redemption.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(redemption.id, "approve")}
                            disabled={processing === redemption.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleStatusChange(redemption.id, "reject")}
                            disabled={processing === redemption.id}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Redemption Details</DialogTitle>
          </DialogHeader>
          {selectedRedemption && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <p><strong>Name:</strong> {selectedRedemption.user.name || "N/A"}</p>
                  <p><strong>Email:</strong> {selectedRedemption.user.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Redemption Information</h4>
                  <p><strong>Redeemed At:</strong> {new Date(selectedRedemption.redeemedAt).toLocaleString()}</p>
                  <p><strong>Status:</strong> {getStatusBadge(selectedRedemption.status)}</p>
                  {selectedRedemption.usedAt && (
                    <p><strong>Used At:</strong> {new Date(selectedRedemption.usedAt).toLocaleString()}</p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Reward Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-lg">{selectedRedemption.reward.name}</h5>
                  <p className="text-gray-600 mb-2">{selectedRedemption.reward.description}</p>
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">{selectedRedemption.reward.pointsCost} points</Badge>
                    <Badge variant="secondary">{selectedRedemption.reward.type}</Badge>
                    {selectedRedemption.reward.value && (
                      <Badge variant="outline">Value: ${selectedRedemption.reward.value}</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
