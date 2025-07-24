"use client"

import { useState, useContext, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import { Web3Context } from "../../context/Web3Context"
import Image from "next/image"
import EditProfileModal from "../../components/profile/EditProfileModal"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { Copy, ExternalLink, Edit, LogOut, User, Wallet, Calendar, Award } from "lucide-react"

export default function UserProfile() {
  const { user, logout } = useAuth()
  const { wallet, connectWallet, disconnectWallet, viewOnExplorer, checkMintStatus } = useContext(Web3Context)
  const [membershipData, setMembershipData] = useState(null)
  const [loading, setLoading] = useState(true)
  // Add this state to control modal visibility
const [isEditModalOpen, setIsEditModalOpen] = useState(false);

// Update the EditProfileModal usage

  useEffect(() => {
    if (user) {
      fetchMembershipData()
    }
  }, [user])

  const fetchMembershipData = async () => {
    try {
      const response = await fetch('/api/user/membership', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setMembershipData(data);
      } else if (response.status === 401) {
        // Handle unauthorized (e.g., redirect to login)
        console.error('Unauthorized - redirecting to login');
        window.location.href = '/auth/signin';
      }
    } catch (error) {
      console.error('Failed to fetch membership data:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleCopyWalletAddress = () => {
    const address = user?.walletAddress || wallet
    if (address) {
      navigator.clipboard.writeText(address)
      alert("Wallet address copied!")
    }
  }

  const handleSignOut = () => {
    logout()
    window.location.href = "/"
  }

  // Refetch membership data after profile update
  const handleProfileUpdated = () => {
    fetchMembershipData()
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="text-muted-foreground mb-4">You need to be signed in to view your profile.</p>
          <Button onClick={() => window.location.href = "/auth/signin"}>
            Sign In
          </Button>
        </div>
      </div>
    )
  }

  // Helper function to get proper image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    if (imagePath.startsWith('/')) return imagePath
    return `/${imagePath}`
  }

  // Prefer membershipData.createdAt, fallback to user.createdAt
  const memberSince = membershipData?.memberSince
    ? new Date(membershipData.memberSince).toLocaleDateString()
    : (user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A")
  const membershipTier = membershipData?.membershipTier || user.membershipTier || "none"
  const loyaltyPoints = membershipData?.loyaltyPoints || user.loyaltyPoints || 0

  // For debug UI
  const profileImageUrl = getImageUrl(user.profileImage)
  const profileBannerUrl = getImageUrl(user.profileBanner)

  return (
    <div className="container mx-auto py-8 px-4 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 relative">
              {getImageUrl(user.profileBanner) ? (
                <Image
                src={getImageUrl(user.profileBanner)}
                alt="Profile Banner"
                fill
                className="object-cover"
                priority // Add this
              />
              ) : null}
            </div>

            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-12">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background">
                  {getImageUrl(user.profileImage) ? (
                    <AvatarImage 
                      src={getImageUrl(user.profileImage)} 
                      alt={user.username || ""} 
                    />
                  ) : (
                    <AvatarFallback>
                      {(user.username || user.email || "").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div> 

              <div className="text-center mt-4">
                <h2 className="text-xl sm:text-2xl font-bold">{user.username || "User"}</h2>
                <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
                <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                  <Wallet className="h-4 w-4 mr-1" />
                  <span className="font-mono">
                    {user.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : "No wallet connected"}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 ml-1" onClick={handleCopyWalletAddress}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <Badge className="mt-2 bg-purple-500">{membershipTier} Member</Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Loyalty Points</p>
                  <p className="text-xl sm:text-2xl font-bold">{loyaltyPoints}</p>
                </div>
                <div className="bg-muted rounded-lg p-4 text-center">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="text-base sm:text-lg font-medium">
                    {memberSince}
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
<EditProfileModal 
          currentData={user}
          onProfileUpdated={handleProfileUpdated}
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        />
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={viewOnExplorer}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Blockchain
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-blue-600 hover:text-blue-700"
                  onClick={connectWallet}
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect Wallet
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-green-600 hover:text-green-700"
                  onClick={checkMintStatus}
                >
                  <Award className="h-4 w-4 mr-2" />
                  Check Mint Status
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-500 hover:text-red-600"
                  onClick={disconnectWallet}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect Wallet
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start text-red-500 hover:text-red-600"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs (NFTs, Transactions) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your account information and activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="nfts">NFTs</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Account Information</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Username:</span>
                            <span>{user.username || "Not set"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Email:</span>
                            <span>{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wallet:</span>
                            <span className="font-mono text-xs">
                              {user.walletAddress || "Not connected"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Membership:</span>
                            <span>{membershipTier}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="font-medium">Activity Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Loyalty Points:</span>
                            <span>{loyaltyPoints}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">NFTs Owned:</span>
                            <span>0</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Transactions:</span>
                            <span>0</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="nfts" className="mt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No NFTs found</p>
                    <Button className="mt-4">Browse NFTs</Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions" className="mt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions found</p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
