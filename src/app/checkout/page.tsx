'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CreditCard, Truck, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import type { CampaignApplicationResult } from '@/lib/campaigns';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    unit: string;
  };
}

interface CartResponse {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [appliedRewards, setAppliedRewards] = useState<any>(null);
  const [appliedCampaigns, setAppliedCampaigns] =
    useState<CampaignApplicationResult | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    fetchCart();
  }, [session, status, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
      if (response.ok) {
        const data = await response.json();
        setCart(data);

        if (data.items.length === 0) {
          toast.error('Your cart is empty');
          router.push('/cart');
          return;
        }
        // Fetch reward preview
        await fetchRewardPreview(data);

        // Apply campaigns
        await applyCampaignDiscounts(data);
      } else {
        toast.error('Failed to load cart');
        router.push('/cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      toast.error('Failed to load cart');
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardPreview = async (cartData: CartResponse) => {
    try {
      if (!cartData) {
        console.log('No cart data available for reward preview');
        return;
      }

      // Get reward preview
      const previewResponse = await fetch('/api/loyalty/preview-rewards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderTotal: cartData.total,
        }),
      });

      if (previewResponse.ok) {
        const previewData = await previewResponse.json();
        setAppliedRewards(previewData);
      }
    } catch (error) {
      console.error('Failed to preview rewards:', error);
    }
  };

  const applyCampaignDiscounts = async (cartData: CartResponse) => {
    try {
      if (!cartData) {
        console.log('No cart data available for campaign application');
        return;
      }

      const response = await fetch('/api/campaigns/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderTotal: cartData.total,
        }),
      });

      if (response.ok) {
        const campaignResult = await response.json();
        setAppliedCampaigns(campaignResult);
      } else {
        console.error('Failed to apply campaigns');
      }
    } catch (error) {
      console.error('Failed to apply campaigns:', error);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim() || !cart) return;

    setApplyingCoupon(true);
    try {
      const response = await fetch('/api/coupons/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: couponCode.trim().toUpperCase(),
          orderTotal: cart.total,
        }),
      });

      if (response.ok) {
        const couponData = await response.json();
        setAppliedCoupon(couponData);
        toast.success('Coupon applied successfully!');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Invalid coupon code');
        setAppliedCoupon(null);
      }
    } catch (error) {
      console.error('Failed to apply coupon:', error);
      toast.error('Failed to apply coupon');
      setAppliedCoupon(null);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || !shippingAddress.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setProcessing(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          shippingAddress,
          paymentMethod,
          appliedRewards, // reward information
          appliedCoupon, // coupon information
          appliedCampaigns, // campaign information
        }),
      });

      if (response.ok) {
        const order = await response.json();
        toast.success('Order placed successfully!');
        router.push(`/orders/${order.id}`);
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to place order');
      }
    } catch (error) {
      toast.error('Failed to place order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!cart) {
    return null;
  }

  const subtotal = cart.total;
  const rewardDiscount = appliedRewards?.discountAmount || 0;
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const campaignDiscount = appliedCampaigns?.totalDiscount || 0;
  const totalDiscount = rewardDiscount + couponDiscount + campaignDiscount;
  const hasFreeShipping =
    subtotal > 50 ||
    appliedRewards?.freeDelivery ||
    appliedCoupon?.freeShipping ||
    appliedCampaigns?.freeShipping;
  const shipping = hasFreeShipping ? 0 : 5.99;
  const discountedSubtotal = subtotal - totalDiscount;
  const tax = Math.max(0, discountedSubtotal) * 0.08;
  const total = Math.max(0, discountedSubtotal) + tax + shipping;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Shipping Address
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Textarea
                      id="address"
                      placeholder="Enter your full delivery address"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      required
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card">
                        Credit/Debit Card (Demo - No actual payment)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash on Delivery</Label>
                    </div>
                  </RadioGroup>

                  {paymentMethod === 'card' && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Demo Mode:</strong> This is a demo application.
                        No actual payment will be processed.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-3">
                    {cart.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{item.product.name}</p>
                          <p className="text-sm text-gray-600">
                            {item.quantity} × ${item.product.price}
                          </p>
                        </div>
                        <span className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing Breakdown */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    {totalDiscount > 0 && (
                      <>
                        {rewardDiscount > 0 && (
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>🎁 Rewards Discount</span>
                            <span>-${rewardDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        {couponDiscount > 0 && (
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>🏷️ Coupon Discount</span>
                            <span>-${couponDiscount.toFixed(2)}</span>
                          </div>
                        )}
                        {campaignDiscount > 0 && (
                          <div className="flex justify-between text-green-600 font-medium">
                            <span>📢 Campaign Discount</span>
                            <span>-${campaignDiscount.toFixed(2)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className={shipping === 0 ? 'text-green-600' : ''}>
                        {shipping === 0 ? '$0.00' : `$${shipping.toFixed(2)}`}
                        {appliedRewards?.freeDelivery && (
                          <span className="text-xs text-green-600 ml-1">
                            (Free delivery reward)
                          </span>
                        )}
                        {appliedCoupon?.freeShipping &&
                          !appliedRewards?.freeDelivery && (
                            <span className="text-xs text-green-600 ml-1">
                              (Free shipping coupon)
                            </span>
                          )}
                        {appliedCampaigns?.freeShipping &&
                          !appliedRewards?.freeDelivery &&
                          !appliedCoupon?.freeShipping && (
                            <span className="text-xs text-green-600 ml-1">
                              (Free shipping campaign)
                            </span>
                          )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Savings Summary */}
                  {totalDiscount > 0 && (
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
                      <div className="flex justify-between items-center text-green-800">
                        <span className="font-medium">💰 You're saving:</span>
                        <span className="font-bold text-lg">
                          ${totalDiscount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-blue-900">
                        Total to Pay
                      </span>
                      <span className="text-2xl font-bold text-blue-900">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="text-sm text-blue-700 mt-1">
                        (Originally $
                        {(subtotal + (subtotal > 50 ? 0 : 5.99)).toFixed(2)}{' '}
                        before discounts)
                      </div>
                    )}
                  </div>

                  {/* Order Rewards (affect current payment) */}
                  {appliedRewards &&
                    appliedRewards.orderRewards &&
                    appliedRewards.orderRewards.length > 0 && (
                      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                        <p className="text-sm font-medium text-green-800 mb-2">
                          🎁 Order Rewards Applied:
                        </p>
                        <ul className="text-xs text-green-700 space-y-1">
                          {appliedRewards.orderRewards.map(
                            (reward: any, index: number) => (
                              <li key={index}>
                                • {reward.name}
                                {reward.type === 'DISCOUNT' && (
                                  <span className="text-green-600 font-medium">
                                    {' '}
                                    - ${reward.value}
                                  </span>
                                )}
                                {reward.type === 'FREE_DELIVERY' && (
                                  <span className="text-green-600 font-medium">
                                    {' '}
                                    (Free shipping)
                                  </span>
                                )}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}

                  {/* Applied Campaigns */}
                  {appliedCampaigns &&
                    appliedCampaigns.campaigns &&
                    appliedCampaigns.campaigns.length > 0 && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-2">
                          📢 Applied Campaigns:
                        </p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          {appliedCampaigns.campaigns.map((campaign, index) => (
                            <li key={index}>
                              • {campaign.campaign.title}
                              {campaign.discountAmount > 0 && (
                                <span className="text-blue-600 font-medium">
                                  {' '}
                                  - ${campaign.discountAmount.toFixed(2)}
                                </span>
                              )}
                              {campaign.freeShipping && (
                                <span className="text-blue-600 font-medium">
                                  {' '}
                                  (Free shipping)
                                </span>
                              )}
                              {campaign.pointsMultiplier > 1 && (
                                <span className="text-blue-600 font-medium">
                                  {' '}
                                  {campaign.pointsMultiplier}x points
                                </span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  {/* Bonus Rewards (received after order) */}
                  {appliedRewards &&
                    appliedRewards.bonusRewards &&
                    appliedRewards.bonusRewards.length > 0 && (
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <p className="text-sm font-medium text-purple-800 mb-2">
                          🎉 Bonus Rewards You'll Receive:
                        </p>
                        <ul className="text-xs text-purple-700 space-y-1">
                          {appliedRewards.bonusRewards.map(
                            (reward: any, index: number) => (
                              <li key={index}>
                                • {reward.name}
                                {reward.type === 'CASHBACK' && (
                                  <span className="text-purple-600 font-medium">
                                    {' '}
                                    +{reward.value} points to your account
                                  </span>
                                )}
                                {reward.type === 'FREE_PRODUCT' && (
                                  <span className="text-purple-600 font-medium">
                                    {' '}
                                    (Contact support to claim)
                                  </span>
                                )}
                              </li>
                            )
                          )}
                        </ul>
                        <p className="text-xs text-purple-600 mt-2">
                          These bonuses will be credited to your account after
                          your order is completed.
                        </p>
                      </div>
                    )}

                  {/* Coupon Code Input */}
                  <div className="mb-4">
                    <Label
                      htmlFor="coupon-code"
                      className="text-sm font-medium text-gray-700 mb-2 block"
                    >
                      Have a Coupon Code?
                    </Label>
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <Input
                          id="coupon-code"
                          placeholder="Enter coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
                          className="flex-1"
                        />
                        <Button
                          onClick={applyCoupon}
                          disabled={applyingCoupon || !couponCode.trim()}
                          variant="outline"
                        >
                          {applyingCoupon ? 'Applying...' : 'Apply'}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-green-50 p-3 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600">🎉</span>
                          <span className="font-medium text-green-800">
                            {appliedCoupon.description}
                          </span>
                          <span className="text-sm text-green-600">
                            (-${appliedCoupon.discountAmount})
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={removeCoupon}
                          className="text-green-700 border-green-300 hover:bg-green-100"
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={processing || !shippingAddress.trim()}
                  >
                    {processing
                      ? 'Processing...'
                      : `Place Order - $${total.toFixed(2)}`}
                  </Button>

                  {shipping > 0 ? (
                    <p className="text-sm text-gray-600 text-center">
                      Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                    </p>
                  ) : (
                    <p className="text-sm text-green-600 text-center">
                      🎉 Free shipping on orders over $50!
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
