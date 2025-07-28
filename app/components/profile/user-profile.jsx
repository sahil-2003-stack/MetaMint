// app/components/profile/UserProfile.jsx
"use client"

import { useState, useContext, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import { Web3Context } from "../../context/Web3Context"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, Edit, LogOut, Wallet, Award, Save, X, Eye, EyeOff, Upload, Image as ImageIcon } from "lucide-react"

export default function UserProfile() {
  const { user, logout, updateUser } = useAuth()
  const { wallet, connectWallet, disconnectWallet, viewOnExplorer, checkMintStatus } = useContext(Web3Context)
  const [membershipData, setMembershipData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    username: "",
    email: "",
    walletAddress: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [editError, setEditError] = useState("")
  const [editSuccess, setEditSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // File upload states
  const [profileImage, setProfileImage] = useState(null)
  const [profileBanner, setProfileBanner] = useState(null)
  const [profileImagePreview, setProfileImagePreview] = useState(null)
  const [profileBannerPreview, setProfileBannerPreview] = useState(null)

  useEffect(() => {
    if (user) fetchMembershipData()
  }, [user])

  useEffect(() => {
    if (user && isEditing) {
      setEditData({
        username: user.username || "",
        email: user.email || "",
        walletAddress: user.walletAddress || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    }
  }, [user, isEditing])

  const fetchMembershipData = async () => {
    try {
      const response = await fetch('/api/user/membership')
      if (response.ok) {
        const data = await response.json()
        setMembershipData(data)
      }
    } catch (error) {
      console.error('Failed to fetch membership data:', error)
    } finally {
      setLoading(false)
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

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing
      setIsEditing(false)
      setEditError("")
      setEditSuccess("")
      setProfileImage(null)
      setProfileBanner(null)
      setProfileImagePreview(null)
      setProfileBannerPreview(null)
    } else {
      // Start editing
      setIsEditing(true)
      setEditData({
        username: user?.username || "",
        email: user?.email || "",
        walletAddress: user?.walletAddress || "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
    }
  }

  const handleInputChange = (field, value) => {
    setEditData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field, file) => {
    if (file) {
      const preview = URL.createObjectURL(file)
      if (field === 'profileImage') {
        setProfileImage(file)
        setProfileImagePreview(preview)
      } else if (field === 'profileBanner') {
        setProfileBanner(file)
        setProfileBannerPreview(preview)
      }
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    setEditError("")
    setEditSuccess("")

    // Password validation
    if (editData.newPassword && !editData.currentPassword) {
      setEditError("Current password is required to change password")
      setIsSaving(false)
      return
    }

    if (editData.newPassword && editData.newPassword !== editData.confirmPassword) {
      setEditError("New passwords do not match")
      setIsSaving(false)
      return
    }

    if (editData.newPassword && editData.newPassword.length < 6) {
      setEditError("New password must be at least 6 characters long")
      setIsSaving(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("userId", user?.id)
      formData.append("username", editData.username)
      formData.append("email", editData.email)
      formData.append("walletAddress", editData.walletAddress)
      
      if (editData.currentPassword) {
        formData.append("currentPassword", editData.currentPassword)
      }
      if (editData.newPassword) {
        formData.append("password", editData.newPassword)
      }
      
      if (profileImage) {
        formData.append("profileImage", profileImage)
      }
      if (profileBanner) {
        formData.append("profileBanner", profileBanner)
      }

      const res = await fetch("/api/user/update", {
        method: "PUT",
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setEditSuccess("Profile updated successfully")
        updateUser(data.user)
        setIsEditing(false)
        setProfileImage(null)
        setProfileBanner(null)
        setProfileImagePreview(null)
        setProfileBannerPreview(null)
        setTimeout(() => {
          setEditSuccess("")
        }, 2000)
      } else {
        const data = await res.json()
        setEditError(data.error || "Update failed")
      }
    } catch (error) {
      setEditError("An error occurred during update")
    } finally {
      setIsSaving(false)
    }
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null
    if (imagePath.startsWith('http')) return imagePath
    if (imagePath.startsWith('/')) return imagePath
    return `/${imagePath}`
  }

  const memberSince = membershipData?.memberSince
    ? new Date(membershipData.memberSince).toLocaleDateString()
    : (user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A")
  const membershipTier = membershipData?.membershipTier || user.membershipTier || "none"
  const loyaltyPoints = membershipData?.loyaltyPoints || user.loyaltyPoints || 0

  return (
    <div className="container mx-auto py-8 px-4 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <div className="h-32 bg-gradient-to-r from-purple-500 to-pink-500 relative">
              {profileBannerPreview ? (
                <Image
                  src={profileBannerPreview}
                  alt="Profile Banner"
                  fill
                  className="object-cover"
                />
              ) : getImageUrl(user.profileBanner) ? (
                <Image
                  src={getImageUrl(user.profileBanner)}
                  alt="Profile Banner"
                  fill
                  className="object-cover"
                />
              ) : null}
            </div>

            <div className="px-6 pb-6">
              <div className="flex justify-center -mt-12">
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background">
                  {profileImagePreview ? (
                    <AvatarImage 
                      src={profileImagePreview} 
                      alt={user.username || ""} 
                    />
                  ) : getImageUrl(user.profileImage) ? (
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
                  <p className="text-base sm:text-lg font-medium">{memberSince}</p>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleEditToggle}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    "Saving..."
                  ) : isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel Edit
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </Button>

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

        {/* Tabs Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
              <CardDescription>Your account information and activity</CardDescription>
            </CardHeader>
            <CardContent>
              {editError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{editError}</AlertDescription>
                </Alert>
              )}
              {editSuccess && (
                <Alert className="mb-4">
                  <AlertDescription>{editSuccess}</AlertDescription>
                </Alert>
              )}
              
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="nfts">NFTs</TabsTrigger>
                  <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <h3 className="font-medium">Account Information</h3>
                      
                      <div className="space-y-3">
                        <div className="flex flex-col space-y-1">
                          <label className="text-sm text-muted-foreground">Username:</label>
                          {isEditing ? (
                            <Input
                              value={editData.username}
                              onChange={(e) => handleInputChange("username", e.target.value)}
                              placeholder="Enter username"
                            />
                          ) : (
                            <span className="text-sm">{user.username || "Not set"}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <label className="text-sm text-muted-foreground">Email:</label>
                          {isEditing ? (
                            <Input
                              type="email"
                              value={editData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              placeholder="Enter email"
                            />
                          ) : (
                            <span className="text-sm">{user.email}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <label className="text-sm text-muted-foreground">Wallet:</label>
                          {isEditing ? (
                            <Input
                              value={editData.walletAddress}
                              onChange={(e) => handleInputChange("walletAddress", e.target.value)}
                              placeholder="0x..."
                            />
                          ) : (
                            <span className="text-sm font-mono">{user.walletAddress || "Not connected"}</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <label className="text-sm text-muted-foreground">Password:</label>
                          {isEditing ? (
                            <div className="space-y-2">
                              <div className="relative">
                                <Input
                                  type={showCurrentPassword ? "text" : "password"}
                                  value={editData.currentPassword}
                                  onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                                  placeholder="Current password (required to change)"
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1 h-8 w-8"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              <div className="relative">
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  value={editData.newPassword}
                                  onChange={(e) => handleInputChange("newPassword", e.target.value)}
                                  placeholder="New password (optional)"
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1 h-8 w-8"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                              <div className="relative">
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  value={editData.confirmPassword}
                                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                                  placeholder="Confirm new password"
                                  className="pr-10"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-1 top-1 h-8 w-8"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm">••••••••</span>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-1">
                          <label className="text-sm text-muted-foreground">Membership:</label>
                          <span className="text-sm">{membershipTier}</span>
                        </div>
                      </div>
                      
                      {isEditing && (
                        <Button 
                          onClick={handleSaveChanges} 
                          disabled={isSaving}
                          className="w-full"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="font-medium">Profile Images</h3>
                      
                      {isEditing && (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Profile Image:</label>
                            <div className="flex items-center space-x-2">
                              <div className="relative w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                                {profileImagePreview ? (
                                  <Image
                                    src={profileImagePreview}
                                    alt="Profile"
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                ) : getImageUrl(user.profileImage) ? (
                                  <Image
                                    src={getImageUrl(user.profileImage)}
                                    alt="Profile"
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange("profileImage", e.target.files?.[0] || null)}
                                  className="hidden"
                                  id="profileImage"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById("profileImage")?.click()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm text-muted-foreground">Profile Banner:</label>
                            <div className="flex items-center space-x-2">
                              <div className="relative w-16 h-16 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                                {profileBannerPreview ? (
                                  <Image
                                    src={profileBannerPreview}
                                    alt="Banner"
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                ) : getImageUrl(user.profileBanner) ? (
                                  <Image
                                    src={getImageUrl(user.profileBanner)}
                                    alt="Banner"
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                ) : (
                                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                              <div className="flex-1">
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange("profileBanner", e.target.files?.[0] || null)}
                                  className="hidden"
                                  id="profileBanner"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById("profileBanner")?.click()}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2 text-sm">
                        <h3 className="font-medium">Activity Summary</h3>
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
                </TabsContent>

                <TabsContent value="nfts" className="mt-6 text-center py-8">
                  <p className="text-muted-foreground">No NFTs found</p>
                  <Button className="mt-4">Browse NFTs</Button>
                </TabsContent>

                <TabsContent value="transactions" className="mt-6 text-center py-8">
                  <p className="text-muted-foreground">No transactions found</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
