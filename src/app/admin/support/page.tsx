'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Search,
  Filter,
  BarChart3,
  Users,
  MessageCircle,
} from 'lucide-react';

interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  messages: Array<{
    id: string;
    message: string;
    createdAt: string;
    isFromAdmin: boolean;
    user?: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    messages: number;
  };
}

const statusConfig = {
  OPEN: { label: 'Open', color: 'bg-blue-100 text-blue-800', icon: HelpCircle },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  WAITING_FOR_USER: {
    label: 'Waiting',
    color: 'bg-orange-100 text-orange-800',
    icon: AlertCircle,
  },
  RESOLVED: {
    label: 'Resolved',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  CLOSED: {
    label: 'Closed',
    color: 'bg-gray-100 text-gray-800',
    icon: CheckCircle,
  },
};

const priorityConfig = {
  LOW: { label: 'Low', color: 'bg-gray-100 text-gray-800' },
  MEDIUM: { label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  HIGH: { label: 'High', color: 'bg-orange-100 text-orange-800' },
  URGENT: { label: 'Urgent', color: 'bg-red-100 text-red-800' },
};

const categoryLabels = {
  ORDER_ISSUE: 'Order Issue',
  PRODUCT_QUESTION: 'Product Question',
  DELIVERY_PROBLEM: 'Delivery Problem',
  PAYMENT_ISSUE: 'Payment Issue',
  ACCOUNT_PROBLEM: 'Account Problem',
  TECHNICAL_ISSUE: 'Technical Issue',
  OTHER: 'Other',
};

export default function AdminSupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all',
    search: '',
  });

  useEffect(() => {
    if (status === 'loading') return;

    if (!session || session.user.role !== 'ADMIN') {
      router.push('/');
      return;
    }

    fetchTickets();
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      fetchTickets();
    }
  }, [filters]);

    const fetchTickets = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.status && filters.status !== 'all') params.append('status', filters.status);
        if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
        if (filters.category && filters.category !== 'all') params.append('category', filters.category);
        if (filters.search && filters.search.trim()) params.append('search', filters.search.trim());

        const response = await fetch(`/api/admin/support/tickets?${params}`);
        if (response.ok) {
          const data = await response.json();
          setTickets(data);
        } else {
          console.error('Failed to fetch tickets');
        }
      } catch (error) {
        console.error('Failed to fetch tickets:', error);
      } finally {
        setLoading(false);
      }
    };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/support/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === ticketId
              ? { ...ticket, status, updatedAt: new Date().toISOString() }
              : ticket
          )
        );
      }
    } catch (error) {
      console.error('Failed to update ticket:', error);
    }
  };

  // Tickets are already filtered by the API
  const filteredTickets = tickets;

  // Calculate stats
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === 'OPEN').length,
    inProgress: tickets.filter((t) => t.status === 'IN_PROGRESS').length,
    resolved: tickets.filter((t) => t.status === 'RESOLVED').length,
    urgent: tickets.filter((t) => t.priority === 'URGENT').length,
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Support Dashboard</h1>
          <p className="text-gray-600">Manage customer support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <MessageSquare className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Tickets
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <HelpCircle className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Open</p>
                  <p className="text-2xl font-bold">{stats.open}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Urgent</p>
                  <p className="text-2xl font-bold">{stats.urgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Input
                  placeholder="Search tickets..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full"
                />
              </div>

              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="WAITING_FOR_USER">Waiting</SelectItem>
                  <SelectItem value="RESOLVED">Resolved</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.priority}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.category}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="ORDER_ISSUE">Order Issue</SelectItem>
                  <SelectItem value="PRODUCT_QUESTION">
                    Product Question
                  </SelectItem>
                  <SelectItem value="DELIVERY_PROBLEM">
                    Delivery Problem
                  </SelectItem>
                  <SelectItem value="PAYMENT_ISSUE">Payment Issue</SelectItem>
                  <SelectItem value="ACCOUNT_PROBLEM">
                    Account Problem
                  </SelectItem>
                  <SelectItem value="TECHNICAL_ISSUE">
                    Technical Issue
                  </SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    status: 'all',
                    priority: 'all',
                    category: 'all',
                    search: '',
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <div className="space-y-4">
          {filteredTickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                <p className="text-gray-600">
                  {tickets.length === 0
                    ? 'No support tickets have been created yet.'
                    : 'Try adjusting your filters.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTickets.map((ticket) => {
              const statusInfo =
                statusConfig[ticket.status as keyof typeof statusConfig];
              const priorityInfo =
                priorityConfig[ticket.priority as keyof typeof priorityConfig];
              const StatusIcon = statusInfo.icon;
              const latestMessage = ticket.messages[0];

              return (
                <Card
                  key={ticket.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <Link href={`/admin/support/${ticket.id}`}>
                          <h3 className="text-lg font-semibold hover:text-blue-600 mb-2">
                            {ticket.subject}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-600">
                            by {ticket.user.name}
                          </span>
                          <span className="text-sm text-gray-400">•</span>
                          <span className="text-sm text-gray-600">
                            {ticket.user.email}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {
                              categoryLabels[
                                ticket.category as keyof typeof categoryLabels
                              ]
                            }
                          </Badge>
                          <Badge className={statusInfo.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                          <Badge className={priorityInfo.color}>
                            {priorityInfo.label}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="text-sm text-gray-500">
                          {new Date(ticket.updatedAt).toLocaleDateString()}
                        </span>
                        <Select
                          value={ticket.status}
                          onValueChange={(value) =>
                            updateTicketStatus(ticket.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OPEN">Open</SelectItem>
                            <SelectItem value="IN_PROGRESS">
                              In Progress
                            </SelectItem>
                            <SelectItem value="WAITING_FOR_USER">
                              Waiting
                            </SelectItem>
                            <SelectItem value="RESOLVED">Resolved</SelectItem>
                            <SelectItem value="CLOSED">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {latestMessage && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {latestMessage.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {latestMessage.isFromAdmin
                            ? 'Support Team'
                            : ticket.user.name}{' '}
                          •{' '}
                          {new Date(
                            latestMessage.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {ticket._count.messages} messages
                      </span>
                      <Button asChild size="sm">
                        <Link href={`/admin/support/${ticket.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
