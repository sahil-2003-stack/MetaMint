"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/app/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { Gift, Star, Trophy, Crown, Zap, Coins, AlertCircle } from "lucide-react"

const rewards = [
  {
    id: 1,
    name: "Bronze NFT",
    description: "Exclusive bronze tier NFT",
    pointsCost: 100,
    tier: "bronze",
    image: "/placeholder.svg",
    type: "nft"
  },
  {
    id: 2,
    name: "Silver NFT",
    description: "Exclusive silver tier NFT",
    pointsCost: 250,
    tier: "silver",
    image: "/placeholder.svg",
    type: "nft"
  },
  {
    id: 3,
    name: "Gold NFT",
    description: "Exclusive gold tier NFT",
    pointsCost: 500,
    tier: "gold",
    image: "/placeholder.svg",
    type: "nft"
  },
  {
    id: 4,
    name: "Store Discount",
    description: "10% off next purchase",
    pointsCost: 75,
    type: "discount",
    value: 0.1
  },
  {
    id: 5,
    name: "Premium Feature Access",
    description: "Unlock premium features for 24 hours",
    pointsCost: 150,
    type: "feature",
    duration: "24h"
  }
]

const tierRequirements = {
  bronze: 0,
  silver: 1000,
  gold: 2500,
  platinum: 5000
}

const tierBenefits = {
  bronze: ["Basic rewards", "Standard support"],
  silver: ["Enhanced rewards", "Priority support", "Exclusive drops"],
  gold: ["Premium rewards", "VIP support", "Early access", "Custom features"],
  platinum: ["Ultimate rewards", "24/7 support", "Exclusive events", "Personal manager"]
}

function RewardModal({ open, onClose, reward, onConfirm, userPoints }) {
  if (!open || !reward) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <Gift className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Redeem Reward</h2>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            <div className="flex-1">
              <h3 className="font-semibold">{reward.name}</h3>
              <p className="text-sm text-muted-foreground">{reward.description}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-primary font-semibold">
                <Coins className="h-4 w-4" />
                {reward.pointsCost}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm">Your Points:</span>
            <span className="font-semibold">{userPoints}</span>
          </div>

          {userPoints < reward.pointsCost && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">
                Insufficient points. You need {reward.pointsCost - userPoints} more points.
              </span>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={onConfirm} 
              disabled={userPoints < reward.pointsCost}
              className="flex-1"
            >
              Confirm Purchase
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LoyaltyDashboard() {
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [loyaltyData, setLoyaltyData] = useState({
    points: 0,
    tier: "bronze",
    transactions: []
  })
  const [loading, setLoading] = useState(true)
  const [selectedReward, setSelectedReward] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchLoyaltyData()
  }, [user])

  const fetchLoyaltyData = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/loyalty/points', {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setLoyaltyData({
          points: data.points || 0,
          tier: data.tier || "bronze",
          transactions: data.transactions || []
        })
      }
    } catch (error) {
      console.error('Failed to fetch loyalty data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRedeemReward = async (reward) => {
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to redeem rewards.", variant: "destructive" })
      return
    }

    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ rewardId: reward.id, pointsCost: reward.pointsCost })
      })

      const data = await response.json()

      if (response.ok) {
        toast({ 
          title: "Reward Redeemed!", 
          description: `Successfully redeemed ${reward.name}!` 
        })
        fetchLoyaltyData() // Refresh data
        setModalOpen(false)
        setSelectedReward(null)
      } else {
        toast({ 
          title: "Redeem Failed", 
          description: data.error || "Failed to redeem reward.", 
          variant: "destructive" 
        })
      }
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "Failed to redeem reward.", 
        variant: "destructive" 
      })
    }
  }

  const getTierIcon = (tier) => {
    switch (tier) {
      case "platinum": return <Crown className="h-5 w-5 text-purple-500" />
      case "gold": return <Trophy className="h-5 w-5 text-yellow-500" />
      case "silver": return <Star className="h-5 w-5 text-gray-400" />
      default: return <Zap className="h-5 w-5 text-orange-500" />
    }
  }

  const getNextTier = (currentTier) => {
    const tiers = ["bronze", "silver", "gold", "platinum"]
    const currentIndex = tiers.indexOf(currentTier)
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null
  }

  const getProgressToNextTier = () => {
    const nextTier = getNextTier(loyaltyData.tier)
    if (!nextTier) return 100

    const currentPoints = loyaltyData.points
    const currentTierPoints = tierRequirements[loyaltyData.tier]
    const nextTierPoints = tierRequirements[nextTier]
    const pointsNeeded = nextTierPoints - currentTierPoints
    const pointsProgress = currentPoints - currentTierPoints

    return Math.min(100, Math.max(0, (pointsProgress / pointsNeeded) * 100))
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading loyalty data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Loyalty Dashboard</h1>
        <p className="text-muted-foreground">Earn and spend points to unlock exclusive rewards</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Status */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTierIcon(loyaltyData.tier)}
                {loyaltyData.tier.charAt(0).toUpperCase() + loyaltyData.tier.slice(1)} Member
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {loyaltyData.points.toLocaleString()}
                </div>
                <p className="text-muted-foreground">Total Points</p>
              </div>

              {getNextTier(loyaltyData.tier) && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress to {getNextTier(loyaltyData.tier)}</span>
                    <span>{Math.round(getProgressToNextTier())}%</span>
                  </div>
                  <Progress value={getProgressToNextTier()} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {tierRequirements[getNextTier(loyaltyData.tier)] - loyaltyData.points} points needed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tierBenefits[loyaltyData.tier].map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Rewards Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Rewards</CardTitle>
              <CardDescription>Spend your points on exclusive rewards and benefits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rewards.map((reward) => (
                  <div key={reward.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{reward.name}</h3>
                        <p className="text-sm text-muted-foreground">{reward.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-primary font-semibold">
                        <Coins className="h-4 w-4" />
                        {reward.pointsCost}
                      </div>
                    </div>
                    
                    {reward.type === 'nft' && (
                      <Badge variant="outline" className="capitalize">
                        {reward.tier} NFT
                      </Badge>
                    )}
                    
                    <Button 
                      onClick={() => {
                        setSelectedReward(reward)
                        setModalOpen(true)
                      }}
                      className="w-full"
                      disabled={loyaltyData.points < reward.pointsCost}
                    >
                      <Gift className="h-4 w-4 mr-2" />
                      {loyaltyData.points < reward.pointsCost ? 'Insufficient Points' : 'Redeem'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <RewardModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setSelectedReward(null)
        }}
        reward={selectedReward}
        onConfirm={() => handleRedeemReward(selectedReward)}
        userPoints={loyaltyData.points}
      />
    </div>
  )
}

