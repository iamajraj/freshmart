"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, HelpCircle } from "lucide-react"
import { toast } from "sonner"
import { Footer } from "@/components/footer"

interface SupportTicket {
  id: string
  subject: string
  status: string
  priority: string
  category: string
  createdAt: string
  updatedAt: string
  messages: Array<{
    id: string
    message: string
    createdAt: string
    isFromAdmin: boolean
    user?: {
      name: string
    }
  }>
  _count: {
    messages: number
  }
}

const statusConfig = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-800", icon: HelpCircle },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  WAITING_FOR_USER: { label: "Waiting for You", color: "bg-orange-100 text-orange-800", icon: AlertCircle },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
}

const categoryLabels = {
  ORDER_ISSUE: "Order Issue",
  PRODUCT_QUESTION: "Product Question",
  DELIVERY_PROBLEM: "Delivery Problem",
  PAYMENT_ISSUE: "Payment Issue",
  ACCOUNT_PROBLEM: "Account Problem",
  TECHNICAL_ISSUE: "Technical Issue",
  OTHER: "Other",
}

type CreateForm = {
  subject: string
  message: string
  category: string
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
}

export default function SupportPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>({
    subject: "",
    message: "",
    category: "",
    priority: "MEDIUM" as const,
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    fetchTickets()
  }, [session, status, router])

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/support/tickets")
      if (response.ok) {
        const data = await response.json()
        setTickets(data)
      } else {
        toast.error("Failed to load support tickets")
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error)
      toast.error("Failed to load support tickets")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createForm),
      })

      if (response.ok) {
        toast.success("Support ticket created successfully!")
        setIsCreateDialogOpen(false)
        setCreateForm({
          subject: "",
          message: "",
          category: "",
          priority: "MEDIUM",
        })
        fetchTickets()
      } else {
        const data = await response.json()
        toast.error(data.message || "Failed to create ticket")
      }
    } catch (error) {
      console.error("Failed to create ticket:", error)
      toast.error("Failed to create ticket")
    } finally {
      setSubmitting(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your support tickets...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Login Required</h1>
              <p className="text-gray-600">
                You need to be logged in to access your support tickets and create new ones.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/auth/signin">
                <Button className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="outline" className="w-full">
                  Create Account
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="w-full">
                  General Contact
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Support Center</h1>
            <p className="text-gray-600">
              Get help with your orders, products, and account
            </p>
          </div>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Ticket
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Support Ticket</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Brief description of your issue"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={createForm.category}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ORDER_ISSUE">Order Issue</SelectItem>
                      <SelectItem value="PRODUCT_QUESTION">Product Question</SelectItem>
                      <SelectItem value="DELIVERY_PROBLEM">Delivery Problem</SelectItem>
                      <SelectItem value="PAYMENT_ISSUE">Payment Issue</SelectItem>
                      <SelectItem value="ACCOUNT_PROBLEM">Account Problem</SelectItem>
                      <SelectItem value="TECHNICAL_ISSUE">Technical Issue</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={createForm.priority}
                    onValueChange={(value) => setCreateForm(prev => ({ ...prev, priority: value as CreateForm['priority'] }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={createForm.message}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Creating..." : "Create Ticket"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No support tickets yet</h2>
            <p className="text-gray-600 mb-6">
              Need help? Create your first support ticket and we'll get back to you soon.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Ticket
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => {
              const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig]
              const StatusIcon = statusInfo.icon
              const latestMessage = ticket.messages[0]

              return (
                <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 line-clamp-2">
                          {ticket.subject}
                        </CardTitle>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">
                            {categoryLabels[ticket.category as keyof typeof categoryLabels]}
                          </Badge>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {latestMessage && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {latestMessage.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {latestMessage.isFromAdmin ? "Support Team" : "You"} •{" "}
                          {new Date(latestMessage.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>{ticket._count.messages} messages</span>
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/support/${ticket.id}`}>
                        View Ticket
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}
