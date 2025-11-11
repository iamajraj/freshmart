'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  quantity: number;
  price: number;
  product: {
    name: string;
  };
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  discountAmount: number;
  rewardsApplied: string | null;
  campaignsApplied: string | null;
  couponsApplied: string | null;
  shippingAddress: string | null;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
  orderItems: OrderItem[];
  couponUsages: Array<{
    discountAmount: number;
    coupon: {
      code: string;
      description: string;
      discountType: string;
      discountValue: number | null;
    };
  }>;
}

const statusConfig = {
  PENDING: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock,
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle,
  },
  PROCESSING: {
    label: 'Processing',
    color: 'bg-orange-100 text-orange-800',
    icon: Package,
  },
  SHIPPED: {
    label: 'Shipped',
    color: 'bg-purple-100 text-purple-800',
    icon: Truck,
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

const statusOptions = [
  { value: 'PENDING', label: 'Pending' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      } else {
        toast.error('Order not found');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order');
      router.push('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        toast.success('Order status updated successfully');
        fetchOrder(); // Refresh order data
      } else {
        toast.error('Failed to update order status');
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-96 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600">The order you're looking for doesn't exist or you don't have permission to view it.</p>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order Details</h1>
            <p className="text-gray-600">Order #{order.id.slice(-8)}</p>
          </div>
        </div>

        {/* Status Update */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Status:</span>
          <div className="flex items-center gap-2">
            <Badge className={`${statusInfo.color} cursor-pointer hover:opacity-80 transition-opacity`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {statusInfo.label}
            </Badge>
            <select
              value={order.status}
              onChange={(e) => updateOrderStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Customer Information</h4>
                  <p><strong>Name:</strong> {order.user.name || "N/A"}</p>
                  <p><strong>Email:</strong> {order.user.email}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Order Details</h4>
                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                  <p><strong>Total:</strong> ${order.totalAmount.toFixed(2)}</p>
                  {order.discountAmount > 0 && (
                    <p><strong>Discount:</strong> <span className="text-green-600">-${order.discountAmount.toFixed(2)}</span></p>
                  )}
                  <p><strong>Status:</strong> <Badge className={statusInfo.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusInfo.label}
                  </Badge></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="font-semibold">
                      ${(item.quantity * item.price).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="space-y-1 pt-4 border-t mt-4">
                {(() => {
                  const subtotal = order.orderItems.reduce(
                    (sum, item) => sum + item.price * item.quantity,
                    0
                  );
                  const discount = order.discountAmount || 0;
                  const discountedSubtotal = subtotal - discount;
                  const shipping = subtotal > 50 ? 0 : 5.99;
                  const tax = discountedSubtotal * 0.08;
                  const finalTotal = order.totalAmount;

                  return (
                    <>
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount:</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span className={shipping === 0 ? "text-green-600" : ""}>
                          {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-semibold">Total</span>
                        <span className="font-bold text-lg">${finalTotal.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Applied Rewards */}
          {order.rewardsApplied &&
            (() => {
              try {
                const rewards = JSON.parse(order.rewardsApplied);
                if (rewards && rewards.length > 0) {
                  // Separate order rewards (applied during checkout) from bonus rewards (applied after)
                  const orderRewards = rewards.filter(
                    (r: any) =>
                      r.type === 'DISCOUNT' || r.type === 'FREE_DELIVERY'
                  );
                  const bonusRewards = rewards.filter(
                    (r: any) =>
                      r.type === 'CASHBACK' || r.type === 'FREE_PRODUCT'
                  );

                  return (
                    <div className="space-y-4">
                      {/* Order Rewards */}
                      {orderRewards.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🎁 Order Rewards Applied
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {orderRewards.map(
                                (reward: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
                                  >
                                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                      <span className="text-green-600 font-semibold text-sm">
                                        ✓
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900">
                                        {reward.name}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {reward.description}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {reward.type}
                                        </Badge>
                                        {reward.type === 'DISCOUNT' &&
                                          reward.value && (
                                            <span className="text-xs text-green-600 font-medium">
                                              Saved: ${reward.value}
                                            </span>
                                          )}
                                        {reward.type === 'FREE_DELIVERY' && (
                                          <span className="text-xs text-green-600 font-medium">
                                            Free shipping applied
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            {order.discountAmount > 0 && (
                              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800">
                                  💰 <strong>Total Savings:</strong> $
                                  {order.discountAmount.toFixed(2)}
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Bonus Rewards */}
                      {bonusRewards.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              🎉 Bonus Rewards Received
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {bonusRewards.map(
                                (reward: any, index: number) => (
                                  <div
                                    key={index}
                                    className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200"
                                  >
                                    <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                      <span className="text-purple-600 font-semibold text-sm">
                                        🎁
                                      </span>
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-gray-900">
                                        {reward.name}
                                      </h4>
                                      <p className="text-sm text-gray-600">
                                        {reward.description}
                                      </p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {reward.type}
                                        </Badge>
                                        {reward.type === 'CASHBACK' &&
                                          reward.value && (
                                            <span className="text-xs text-purple-600 font-medium">
                                              +{reward.value} points credited
                                              to your account
                                            </span>
                                          )}
                                        {reward.type === 'FREE_PRODUCT' && (
                                          <span className="text-xs text-purple-600 font-medium">
                                            Contact support to claim your free
                                            item
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                            <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <p className="text-sm text-purple-800">
                                💎 <strong>Bonus Value:</strong> These rewards
                                were credited to your account after order
                                completion.
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  );
                }
              } catch (error) {
                console.error('Error parsing rewards data:', error);
              }
              return null;
            })()}

          {/* Applied Coupons */}
          {order.couponsApplied &&
            (() => {
              try {
                const coupons = JSON.parse(order.couponsApplied);
                return coupons && coupons.length > 0;
              } catch (e) {
                return false;
              }
            })() && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🏷️ Coupons Applied
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Display couponsApplied data */}
                    {order.couponsApplied &&
                      (() => {
                        try {
                          const coupons = JSON.parse(
                            order.couponsApplied
                          );
                          return (
                            coupons &&
                            coupons.map(
                              (coupon: any, index: number) => (
                                <div
                                  key={`applied-${index}`}
                                  className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                                >
                                  <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                    <span className="text-orange-600 font-semibold text-sm">
                                      🏷️
                                    </span>
                                  </div>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-gray-900">
                                      {coupon.description}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {coupon.code}
                                      </Badge>
                                      <span className="text-xs text-orange-600 font-medium">
                                        Saved: $
                                        {coupon.discountAmount.toFixed(
                                          2
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )
                            )
                          );
                        } catch (error) {
                          console.error(
                            'Error parsing coupons data:',
                            error
                          );
                          return (
                            <div className="text-red-500">
                              Error displaying coupons
                            </div>
                          );
                        }
                      })()}
                  </div>
                  {/* Calculate total coupon savings */}
                  {(() => {
                    let totalSavings = 0;

                    if (order.couponsApplied) {
                      try {
                        const coupons = JSON.parse(
                          order.couponsApplied
                        );
                        totalSavings += coupons.reduce(
                          (sum: number, coupon: any) =>
                            sum + (coupon.discountAmount || 0),
                          0
                        );
                      } catch {}
                    }

                    if (order.couponUsages) {
                      totalSavings += order.couponUsages.reduce(
                        (sum, usage) =>
                          sum + usage.discountAmount,
                        0
                      );
                    }

                    return totalSavings > 0 ? (
                      <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-sm text-orange-800">
                          💰 <strong>Coupon Savings:</strong> $
                          {totalSavings.toFixed(2)}
                        </p>
                      </div>
                    ) : null;
                  })()}
                </CardContent>
              </Card>
            )}

          {/* Applied Campaigns */}
          {order.campaignsApplied &&
            (() => {
              try {
                const campaigns = JSON.parse(
                  order.campaignsApplied
                );
                if (campaigns && campaigns.length > 0) {
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          📢 Campaign Applied
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {campaigns.map((campaign: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-semibold text-sm">📢</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {campaign.campaign?.title || 'Unknown Campaign'}
                                </h4>
                                <p className="text-sm text-gray-600">
                                  {campaign.campaign?.description || 'No description'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {campaign.campaign?.type || 'N/A'}
                                  </Badge>
                                  {campaign.discountAmount > 0 && (
                                    <span className="text-xs text-blue-600 font-medium">
                                      {' '}
                                      - ${campaign.discountAmount.toFixed(2)}
                                    </span>
                                  )}
                                  {campaign.freeShipping && (
                                    <span className="text-xs text-blue-600 font-medium">
                                      {' '}
                                      (Free shipping)
                                    </span>
                                  )}
                                  {campaign.pointsMultiplier > 1 && (
                                    <span className="text-xs text-blue-600 font-medium">
                                      {' '}
                                      {campaign.pointsMultiplier}x points
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            💰 <strong>Campaign Savings:</strong> $
                            {campaigns.reduce((sum: number, campaign: any) => sum + (campaign.discountAmount || 0), 0).toFixed(2)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                }
                return null;
              } catch (error) {
                console.error(
                  'Error parsing campaigns data:',
                  error
                );
                return (
                  <div className="text-red-500">
                    Error displaying campaigns
                  </div>
                );
              }
            })()}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Shipping Address */}
          {order.shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-line">
                  {order.shippingAddress}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                🖨️ Print Order
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href={`mailto:${order.user.email}`}>
                  📧 Email Customer
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
