"use client"

import Image from "next/image"
import { useContext, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import { Web3Context } from "@/app/context/Web3Context"
import { useAuth } from "@/app/hooks/useAuth"
import { toast } from "sonner"

const membershipTiers = [
  {
    id: "bronze",
    name: "Bronze",
    description: "Entry level membership with basic benefits",
    price: "0.05 ETH",
    imageSrc: "/placeholder.svg?height=200&width=200",
    benefits: [
      { name: "10% discount on all purchases" },
      { name: "Access to basic community features" },
      { name: "Monthly newsletter" },
    ],
  },
  {
    id: "silver",
    name: "Silver",
    description: "Mid-tier membership with enhanced benefits",
    price: "0.15 ETH",
    imageSrc: "/placeholder.svg?height=200&width=200",
    benefits: [
      { name: "20% discount on all purchases" },
      { name: "Early access to new NFT drops" },
      { name: "Exclusive community events" },
      { name: "Quarterly digital rewards" },
    ],
    featured: true,
  },
  {
    id: "gold",
    name: "Gold",
    description: "Premium membership with exclusive benefits",
    price: "0.5 ETH",
    imageSrc: "/placeholder.svg?height=200&width=200",
    benefits: [
      { name: "30% discount on all purchases" },
      { name: "Priority access to limited edition NFTs" },
      { name: "VIP community access" },
      { name: "Monthly digital rewards" },
      { name: "One-on-one consultations" },
    ],
  },
]

export default function MembershipTiers() {
  const { contract, connectWallet, wallet } = useContext(Web3Context)
  const { user } = useAuth()
  const [loadingTier, setLoadingTier] = useState(null)

  const handleMintNFT = async (tier) => {
    if (!user) {
      toast.error("Please sign in to mint a membership NFT.")
      return
    }
    if (!wallet) {
      try {
        await connectWallet()
      } catch (err) {
        toast.error("Wallet connection failed.")
        return
      }
    }
    if (!contract) {
      toast.error("Smart contract not loaded. Please refresh and try again.")
      return
    }
    setLoadingTier(tier)
    try {
      // 1. Call smart contract mintMembership
      const tx = await contract.mintMembership(tier.toLowerCase())
      await tx.wait()
      // 2. Update DB
      const res = await fetch("/api/membership/mint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, tier: tier.toLowerCase() }),
      })
      if (!res.ok) {
        throw new Error("Failed to update membership in database.")
      }
      toast.success(`Success: ${tier} NFT minted!`)
    } catch (err) {
      toast.error(err?.message || `Failed to mint ${tier} NFT.`)
    } finally {
      setLoadingTier(null)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold mb-2">Membership Tiers</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the membership tier that best suits your needs and unlock exclusive benefits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {membershipTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`flex flex-col h-full ${tier.featured ? "border-primary shadow-lg relative" : ""}`}
          >
            {tier.featured && (
              <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">Popular</Badge>
            )}
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-muted">
                  <Image src={tier.imageSrc || "/placeholder.svg"} alt={tier.name} fill className="object-cover" />
                </div>
              </div>
              <CardTitle className="text-center text-xl sm:text-2xl">{tier.name}</CardTitle>
              <CardDescription className="text-center">{tier.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <p className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">{tier.price}</p>
              <ul className="space-y-2">
                {tier.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-primary mr-2 flex-shrink-0 mt-0.5" />
                    <span>{benefit.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={tier.featured ? "default" : "outline"}
                onClick={() => handleMintNFT(tier.name)}
                disabled={loadingTier === tier.name}
              >
                {loadingTier === tier.name ? `Minting...` : `Mint ${tier.name} NFT`}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

