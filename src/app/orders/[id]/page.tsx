'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Package, Truck, CheckCircle, Clock, Star, Send } from 'lucide-react';
import { toast } from 'sonner';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    image: string | null;
    category: {
      name: string;
    };
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
    icon: Clock,
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewStates, setReviewStates] = useState<
    Record<string, { rating: number; comment: string; submitting: boolean }>
  >({});

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/orders/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        // Initialize review states for delivered orders
        if (data.status === 'DELIVERED') {
          const initialStates: Record<
            string,
            { rating: number; comment: string; submitting: boolean }
          > = {};
          data.orderItems.forEach((item: OrderItem) => {
            initialStates[item.product.id] = {
              rating: 5,
              comment: '',
              submitting: false,
            };
          });
          setReviewStates(initialStates);
        }
      } else {
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const updateReviewState = (
    productId: string,
    updates: Partial<{ rating: number; comment: string; submitting: boolean }>
  ) => {
    setReviewStates((prev) => ({
      ...prev,
      [productId]: { ...prev[productId], ...updates },
    }));
  };

  const submitReview = async (productId: string, e: React.FormEvent) => {
    e.preventDefault();

    const reviewState = reviewStates[productId];
    if (!reviewState) return;

    updateReviewState(productId, { submitting: true });

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating: reviewState.rating,
          comment: reviewState.comment.trim() || undefined,
        }),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        updateReviewState(productId, { comment: '', rating: 5 });
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      updateReviewState(productId, { submitting: false });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-600">
            The order you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button asChild className="mt-4">
            <Link href="/orders">View My Orders</Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo =
    statusConfig[order.status as keyof typeof statusConfig] ||
    statusConfig.PENDING;
  const StatusIcon = statusInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold">Order #{order.id.slice(-8)}</h1>
            <Badge className={statusInfo.color}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
          <p className="text-gray-600">
            Ordered on {new Date(order.createdAt).toLocaleDateString()} at{' '}
            {new Date(order.createdAt).toLocaleTimeString()}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.orderItems.map((item) => (
                  <div key={item.id}>
                    <div className="flex gap-4">
                      <Link href={`/products/${item.product.id}`}>
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                          {item.product.image ? (
                            <Image
                              src={item.product.image}
                              alt={item.product.name}
                              width={64}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              🛒
                            </div>
                          )}
                        </div>
                      </Link>
                      <div className="flex-1">
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-semibold hover:text-primary">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-gray-600 mb-1">
                          {item.product.category.name}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm">
                            {item.quantity} × ${item.price.toFixed(2)}
                          </span>
                          <span className="font-semibold">
                            ${(item.quantity * item.price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Review Section for Delivered Orders */}
                    {order.status === 'DELIVERED' &&
                      reviewStates[item.product.id] && (
                        <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                          <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                            <Star className="w-4 h-4 text-orange-500" />
                            Write a Review
                          </h4>
                          <form
                            onSubmit={(e) => submitReview(item.product.id, e)}
                            className="space-y-3"
                          >
                            <div>
                              <label className="block text-xs font-medium mb-1">
                                Rating
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() =>
                                      updateReviewState(item.product.id, {
                                        rating: star,
                                      })
                                    }
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`w-5 h-5 ${
                                        star <=
                                        reviewStates[item.product.id].rating
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      } hover:text-yellow-400 transition-colors`}
                                    />
                                  </button>
                                ))}
                                <span className="ml-2 text-xs text-gray-600 self-center">
                                  {reviewStates[item.product.id].rating} star
                                  {reviewStates[item.product.id].rating !== 1
                                    ? 's'
                                    : ''}
                                </span>
                              </div>
                            </div>

                            <div>
                              <label
                                htmlFor={`comment-${item.product.id}`}
                                className="block text-xs font-medium mb-1"
                              >
                                Comment (Optional)
                              </label>
                              <Textarea
                                id={`comment-${item.product.id}`}
                                placeholder="Share your thoughts about this product..."
                                value={reviewStates[item.product.id].comment}
                                onChange={(e) =>
                                  updateReviewState(item.product.id, {
                                    comment: e.target.value,
                                  })
                                }
                                rows={2}
                                className="resize-none text-sm"
                              />
                            </div>

                            <Button
                              type="submit"
                              size="sm"
                              disabled={
                                reviewStates[item.product.id].submitting
                              }
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              {reviewStates[item.product.id].submitting ? (
                                'Submitting...'
                              ) : (
                                <>
                                  <Send className="w-3 h-3 mr-1" />
                                  Submit Review
                                </>
                              )}
                            </Button>
                          </form>
                        </div>
                      )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Calculate amounts properly */}
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
                        <span>Items ({order.orderItems.length})</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-${discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span
                          className={shipping === 0 ? 'text-green-600' : ''}
                        >
                          {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${tax.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-semibold">
                        <span>Total</span>
                        <span>${finalTotal.toFixed(2)}</span>
                      </div>
                    </>
                  );
                })()}
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
                                      <div className="shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
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
                                      <div className="shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
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
                            const coupons = JSON.parse(order.couponsApplied);
                            return (
                              coupons &&
                              coupons.map((coupon: any, index: number) => (
                                <div
                                  key={`applied-${index}`}
                                  className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
                                >
                                  <div className="shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
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
                                        {coupon.discountAmount.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            );
                          } catch (error) {
                            console.error('Error parsing coupons data:', error);
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
                          const coupons = JSON.parse(order.couponsApplied);
                          totalSavings += coupons.reduce(
                            (sum: number, coupon: any) =>
                              sum + (coupon.discountAmount || 0),
                            0
                          );
                        } catch {}
                      }

                      if (order.couponUsages) {
                        totalSavings += order.couponUsages.reduce(
                          (sum, usage) => sum + usage.discountAmount,
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
                  console.log('CampaignsApplied raw:', order.campaignsApplied);
                  const campaigns = JSON.parse(order.campaignsApplied);
                  console.log('Parsed campaigns:', campaigns);
                  console.log('Campaigns length:', campaigns?.length);
                  if (campaigns && campaigns.length > 0) {
                    console.log('Rendering campaigns section');
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
                              <div
                                key={index}
                                className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
                              >
                                <div className="shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-semibold text-sm">
                                    📢
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-gray-900">
                                    {campaign.campaign?.title ||
                                      'Unknown Campaign'}
                                  </h4>
                                  <p className="text-sm text-gray-600">
                                    {campaign.campaign?.description ||
                                      'No description'}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
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
                              {campaigns
                                .reduce(
                                  (sum: number, campaign: any) =>
                                    sum + (campaign.discountAmount || 0),
                                  0
                                )
                                .toFixed(2)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                } catch (error) {
                  console.error('Error parsing campaigns data:', error);
                  return (
                    <div className="text-red-500">
                      Error displaying campaigns
                    </div>
                  );
                }
              })()}

            {/* Shipping Address */}
            {order.shippingAddress && (
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line">
                    {order.shippingAddress}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/orders">View All Orders</Link>
              </Button>
              <Button asChild className="flex-1">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
