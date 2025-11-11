'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Users, UserCheck, Crown, Calendar, Mail, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: string;
  _count: {
    orders: number;
    carts: number;
  };
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        toast.success('User role updated successfully');
        fetchUsers(); // Refresh users
      } else {
        toast.error('Failed to update user role');
      }
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const viewUserDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const roleConfig = {
    CUSTOMER: {
      label: 'Customer',
      color: 'bg-blue-100 text-blue-800',
      icon: Users,
    },
    ADMIN: {
      label: 'Admin',
      color: 'bg-purple-100 text-purple-800',
      icon: Crown,
    },
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const customerCount = users.filter((user) => user.role === 'CUSTOMER').length;
  const adminCount = users.filter((user) => user.role === 'ADMIN').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <div className="text-sm text-gray-600">Total Users: {users.length}</div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg mr-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{customerCount}</div>
                <div className="text-sm text-gray-600">Customers</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg mr-4">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{adminCount}</div>
                <div className="text-sm text-gray-600">Admins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg mr-4">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{users.length}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roleInfo =
                  roleConfig[user.role as keyof typeof roleConfig] ||
                  roleConfig.CUSTOMER;
                const RoleIcon = roleInfo.icon;

                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                          {user.name?.charAt(0)?.toUpperCase() ||
                            user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.name || 'No name'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {user.id.slice(-8)}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge
                            className={`${roleInfo.color} cursor-pointer hover:opacity-80 transition-opacity`}
                          >
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                            {user.email !== 'admin@freshmart.com' && (
                              <ChevronDown className="w-3 h-3 ml-2" />
                            )}
                          </Badge>
                        </DropdownMenuTrigger>
                        {user.email !== 'admin@freshmart.com' && (
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() =>
                                updateUserRole(user.id, 'CUSTOMER')
                              }
                              className="flex items-center"
                            >
                              <Users className="w-4 h-4 mr-2" />
                              Set as Customer
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => updateUserRole(user.id, 'ADMIN')}
                              className="flex items-center"
                            >
                              <Crown className="w-4 h-4 mr-2" />
                              Set as Admin
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        )}
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user._count.orders} orders
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name?.charAt(0)?.toUpperCase() ||
                    selectedUser.email.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {selectedUser.name || 'No name set'}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <Badge
                    className={`mt-2 ${
                      roleConfig[selectedUser.role as keyof typeof roleConfig]
                        ?.color || roleConfig.CUSTOMER.color
                    }`}
                  >
                    {roleConfig[selectedUser.role as keyof typeof roleConfig]
                      ?.label || 'Customer'}
                  </Badge>
                </div>
              </div>

              {/* User Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedUser._count.orders}
                  </div>
                  <div className="text-sm text-gray-600">Total Orders</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {selectedUser._count.carts}
                  </div>
                  <div className="text-sm text-gray-600">Cart Items</div>
                </div>
              </div>

              {/* Account Details */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">User ID</span>
                  <span className="text-sm text-gray-600 font-mono">
                    {selectedUser.id}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Email</span>
                  <span className="text-sm">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Role</span>
                  <Badge
                    className={
                      roleConfig[selectedUser.role as keyof typeof roleConfig]
                        ?.color || roleConfig.CUSTOMER.color
                    }
                  >
                    {roleConfig[selectedUser.role as keyof typeof roleConfig]
                      ?.label || 'Customer'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="font-medium">Joined</span>
                  <span className="text-sm text-gray-600">
                    {new Date(selectedUser.createdAt).toLocaleDateString()} at{' '}
                    {new Date(selectedUser.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-medium">Account Age</span>
                  <span className="text-sm text-gray-600">
                    {Math.floor(
                      (new Date().getTime() -
                        new Date(selectedUser.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}{' '}
                    days
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
