"use client"

import { useState, useEffect } from "react"
import { PageLayout } from "@/components/page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Trophy,
  Star,
  Gift,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Award,
  Package,
} from "lucide-react"
import { toast } from "sonner"

interface LoyaltyData {
  points: number
  tier: string
  totalSpent: number
  transactionCount: number
  tierInfo: {
    nextTier: string | null
    pointsToNext: number
    progress: number
  }
  recentTransactions: Array<{
    id: string
    amount: number
    type: string
    description: string
    createdAt: string
  }>
  redeemedRewards: Array<{
    id: string
    redeemedAt: string
    usedAt: string | null
    status: string
    reward: {
      id: string
      name: string
      description: string
      pointsCost: number
      value: number
      type: string
    }
  }>
}

interface Reward {
  id: string
  name: string
  description: string
  pointsCost: number
  value: number
  type: string
  canAfford: boolean
}

const tierConfig = {
  BRONZE: {
    color: "bg-amber-600",
    icon: Trophy,
    benefits: ["10 points per $1 spent", "Standard rewards access"],
  },
  SILVER: {
    color: "bg-gray-400",
    icon: Star,
    benefits: ["10 points per $1 spent", "Priority customer support", "Exclusive promotions"],
  },
  GOLD: {
    color: "bg-yellow-500",
    icon: Award,
    benefits: ["10 points per $1 spent", "VIP customer support", "Exclusive promotions", "Birthday bonus"],
  },
  PLATINUM: {
    color: "bg-purple-600",
    icon: Crown,
    benefits: ["10 points per $1 spent", "Concierge support", "Exclusive promotions", "Birthday bonus", "Free upgrades"],
  },
}

export default function LoyaltyPage() {
  const [loyaltyData, setLoyaltyData] = useState<LoyaltyData | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const [redeeming, setRedeeming] = useState<string | null>(null)

  useEffect(() => {
    fetchLoyaltyData()
    fetchRewards()
  }, [])

  const fetchLoyaltyData = async () => {
    try {
      const response = await fetch("/api/loyalty")
      if (response.ok) {
        const data = await response.json()
        setLoyaltyData(data)
      }
    } catch (error) {
      console.error("Failed to fetch loyalty data:", error)
      toast.error("Failed to load loyalty information")
    }
  }

  const fetchRewards = async () => {
    try {
      const response = await fetch("/api/loyalty/rewards")
      if (response.ok) {
        const data = await response.json()
        setRewards(data)
      }
    } catch (error) {
      console.error("Failed to fetch rewards:", error)
      toast.error("Failed to load rewards")
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemReward = async (rewardId: string, rewardName: string) => {
    setRedeeming(rewardId)
    try {
      const response = await fetch(`/api/loyalty/rewards/${rewardId}/redeem`, {
        method: "POST",
      })

      if (response.ok) {
        toast.success(`Successfully redeemed: ${rewardName}`)
        // Refresh data with a small delay to ensure DB is updated
        setTimeout(async () => {
          await fetchLoyaltyData()
          await fetchRewards()
        }, 500)
      } else {
        const error = await response.json()
        toast.error(error.message || "Failed to redeem reward")
      }
    } catch (error) {
      console.error("Failed to redeem reward:", error)
      toast.error("Failed to redeem reward")
    } finally {
      setRedeeming(null)
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "PURCHASE":
        return <TrendingUp className="w-4 h-4 text-green-600" />
      case "REDEMPTION":
        return <Gift className="w-4 h-4 text-red-600" />
      case "REFERRAL_BONUS":
        return <Trophy className="w-4 h-4 text-blue-600" />
      case "PROMOTION_BONUS":
        return <Star className="w-4 h-4 text-purple-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (!loyaltyData) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-gray-600">Unable to load loyalty information.</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  const currentTierConfig = tierConfig[loyaltyData.tier as keyof typeof tierConfig]

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Loyalty Program</h1>
          <p className="text-gray-600">
            Earn points on every purchase and unlock exclusive rewards and benefits.
          </p>
        </div>

        {/* Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Available Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {loyaltyData.points.toLocaleString()}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Earn 10 points per $1 spent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Tier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${currentTierConfig.color}`}>
                  <currentTierConfig.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold capitalize">{loyaltyData.tier}</span>
              </div>
              <p className="text-sm text-gray-600">
                ${loyaltyData.totalSpent.toLocaleString()} total spent
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tier Progress</CardTitle>
            </CardHeader>
            <CardContent>
              {loyaltyData.tierInfo.nextTier ? (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress to {loyaltyData.tierInfo.nextTier}</span>
                    <span>{loyaltyData.tierInfo.progress}%</span>
                  </div>
                  <Progress value={loyaltyData.tierInfo.progress} className="mb-2" />
                  <p className="text-sm text-gray-600">
                    ${loyaltyData.tierInfo.pointsToNext.toLocaleString()} more to spend
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium">Top Tier Achieved!</p>
                  <p className="text-xs text-gray-600">You're at Platinum level</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Tier Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentTierConfig.icon className="w-5 h-5" />
                {loyaltyData.tier} Tier Benefits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {currentTierConfig.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-sm">{benefit}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {loyaltyData.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {loyaltyData.recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(transaction.type)}
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Available Rewards */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Available Rewards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <Card key={reward.id} className={`relative ${!reward.canAfford ? 'opacity-60' : ''}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{reward.name}</CardTitle>
                    <Badge variant={reward.canAfford ? "default" : "secondary"}>
                      {reward.pointsCost} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4">{reward.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Value: ${reward.value}
                    </span>
                    <Button
                      size="sm"
                      disabled={!reward.canAfford || redeeming === reward.id}
                      onClick={() => handleRedeemReward(reward.id, reward.name)}
                    >
                      {redeeming === reward.id ? "Redeeming..." : "Redeem"}
                    </Button>
                  </div>
                </CardContent>
                {!reward.canAfford && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
                    <div className="text-center">
                      <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">
                        Need {reward.pointsCost - loyaltyData.points} more points
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Redeemed Rewards */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">My Rewards</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Redeemed Rewards
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loyaltyData.redeemedRewards.length > 0 ? (
                <div className="space-y-4">
                  {loyaltyData.redeemedRewards.map((redeemedReward) => (
                    <div key={redeemedReward.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{redeemedReward.reward.name}</h4>
                          <p className="text-gray-600 text-sm mb-2">{redeemedReward.reward.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>Redeemed: {new Date(redeemedReward.redeemedAt).toLocaleDateString()}</span>
                            <span>Cost: {redeemedReward.reward.pointsCost} points</span>
                            <span>Value: ${redeemedReward.reward.value}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={redeemedReward.status === 'APPROVED' ? 'default' : redeemedReward.status === 'PENDING' ? 'secondary' : 'outline'}
                            className="mb-2"
                          >
                            {redeemedReward.status === 'PENDING' ? 'Processing' :
                             redeemedReward.status === 'APPROVED' ? 'Ready to Use' :
                             redeemedReward.status === 'USED' ? 'Used' : 'Rejected'}
                          </Badge>
                          {redeemedReward.usedAt && (
                            <p className="text-xs text-gray-500">
                              Used: {new Date(redeemedReward.usedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      {redeemedReward.status === 'APPROVED' && (
                        <div className="mt-3 space-y-2">
                          <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-sm text-green-800">
                              <strong>How to use:</strong> {
                                redeemedReward.reward.type === 'DISCOUNT' ? 'Will be applied automatically at checkout' :
                                redeemedReward.reward.type === 'FREE_DELIVERY' ? 'Will be applied automatically to your next order' :
                                redeemedReward.reward.type === 'FREE_PRODUCT' ? 'Contact support to select your free product' :
                                redeemedReward.reward.type === 'CASHBACK' ? 'Amount credited to your account balance' :
                                'Check your email for redemption instructions'
                              }
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {redeemedReward.reward.type === 'FREE_PRODUCT' ? (
                              <Button size="sm" variant="outline" asChild>
                                <a href="/contact">Contact Support</a>
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                Applied Automatically
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">No redeemed rewards yet</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Redeem your points for discounts, free delivery, and more rewards above.
                  </p>
                  <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                    <strong>How to use rewards:</strong><br />
                    • <strong>Discount codes</strong> will be applied automatically at checkout<br />
                    • <strong>Free delivery</strong> will be applied to your next eligible order<br />
                    • <strong>Cashback rewards</strong> will be credited to your account<br />
                    • Check your email for redemption confirmations and instructions
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Referral Program */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              Referral Program
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Earn Points by Referring Friends</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Share your referral code with friends. When they make their first purchase,
                  you'll both earn 200 bonus points!
                </p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Your referral code:</p>
                  <p className="font-mono text-lg font-bold">REF-{loyaltyData.points}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">How It Works</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>1. Share your referral code with friends</li>
                  <li>2. They sign up and make their first purchase</li>
                  <li>3. You both receive 200 bonus points</li>
                  <li>4. Points are added to your account automatically</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
