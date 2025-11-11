"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowLeft, Send, User, Shield } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface SupportTicket {
  id: string
  subject: string
  status: string
  priority: string
  category: string
  createdAt: string
  updatedAt: string
  user: {
    id: string
    name: string
    email: string
  }
  messages: Array<{
    id: string
    message: string
    createdAt: string
    isFromAdmin: boolean
    user?: {
      id: string
      name: string
      image: string
    }
  }>
}

const statusConfig = {
  OPEN: { label: "Open", color: "bg-blue-100 text-blue-800" },
  IN_PROGRESS: { label: "In Progress", color: "bg-yellow-100 text-yellow-800" },
  WAITING_FOR_USER: { label: "Waiting for You", color: "bg-orange-100 text-orange-800" },
  RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-800" },
  CLOSED: { label: "Closed", color: "bg-gray-100 text-gray-800" },
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

export default function SupportTicketPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [loading, setLoading] = useState(true)
  const [newMessage, setNewMessage] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchTicket()
    }
  }, [params.id])

  const fetchTicket = async () => {
    try {
      const response = await fetch(`/api/support/tickets/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setTicket(data)
      } else if (response.status === 404) {
        toast.error("Ticket not found")
        router.push("/support")
      } else {
        toast.error("Failed to load ticket")
      }
    } catch (error) {
      console.error("Failed to fetch ticket:", error)
      toast.error("Failed to load ticket")
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    setSendingMessage(true)
    try {
      const response = await fetch(`/api/support/tickets/${params.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: newMessage.trim(),
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setTicket(prev => prev ? {
          ...prev,
          messages: [...prev.messages, message],
          updatedAt: new Date().toISOString(),
        } : null)
        setNewMessage("")
        toast.success("Message sent successfully")
      } else {
        const data = await response.json()
        toast.error(data.message || "Failed to send message")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
      toast.error("Failed to send message")
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
          <p className="text-gray-600 mb-6">
            The support ticket you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button asChild>
            <Link href="/support">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Support
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[ticket.status as keyof typeof statusConfig]
  const canReply = ticket.status !== "CLOSED"

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/support">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Support
            </Link>
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{ticket.subject}</h1>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="secondary">
                  {categoryLabels[ticket.category as keyof typeof categoryLabels]}
                </Badge>
                <Badge className={statusInfo.color}>
                  {statusInfo.label}
                </Badge>
                <span className="text-sm text-gray-500">
                  Created {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Messages */}
          <div className="lg:col-span-2 space-y-4">
            {ticket.messages.map((message) => (
              <Card key={message.id} className={message.isFromAdmin ? "bg-blue-50 border-blue-200" : ""}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={message.user?.image} />
                      <AvatarFallback>
                        {message.isFromAdmin ? (
                          <Shield className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold">
                          {message.isFromAdmin ? "Support Team" : message.user?.name || "You"}
                        </span>
                        {message.isFromAdmin && (
                          <Badge variant="secondary" className="text-xs">
                            Support
                          </Badge>
                        )}
                        <span className="text-sm text-gray-500">
                          {new Date(message.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {message.message}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Reply Form */}
            {canReply && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Reply</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSendMessage}>
                    <div className="space-y-4">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message here..."
                        rows={4}
                        required
                      />
                      <Button
                        type="submit"
                        disabled={sendingMessage || !newMessage.trim()}
                        className="w-full sm:w-auto"
                      >
                        {sendingMessage ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {ticket.status === "CLOSED" && (
              <Card className="bg-gray-50 border-gray-200">
                <CardContent className="p-4 text-center">
                  <p className="text-gray-600">
                    This ticket has been closed. If you need further assistance, please create a new ticket.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={statusInfo.color}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Priority</label>
                  <div className="mt-1">
                    <Badge variant="outline">
                      {ticket.priority}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {categoryLabels[ticket.category as keyof typeof categoryLabels]}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <div className="mt-1 text-sm text-gray-700">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <div className="mt-1 text-sm text-gray-700">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
