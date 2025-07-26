"use client"

import { useState, useMemo, useEffect } from "react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "../../hooks/useAuth"
import { Edit, Upload, Image as ImageIcon, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

export default function EditProfileModal({ currentData, onProfileUpdated }) {
  const { user, updateUser } = useAuth()
  const [formData, setFormData] = useState({
    username: currentData?.username || "",
    email: currentData?.email || "",
    walletAddress: currentData?.walletAddress || "",
    password: "",
    confirmPassword: "",
    profileImage: null,
    profileBanner: null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  // Remove open state and modalError

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (field, file) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  // Add local state to control Dialog open for closing after save
  const [dialogOpen, setDialogOpen] = useState(false)

  // Memoize image previews
  const profileImagePreview = useMemo(
    () => formData.profileImage ? URL.createObjectURL(formData.profileImage) : null,
    [formData.profileImage]
  )
  const profileBannerPreview = useMemo(
    () => formData.profileBanner ? URL.createObjectURL(formData.profileBanner) : null,
    [formData.profileBanner]
  )

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (profileImagePreview) URL.revokeObjectURL(profileImagePreview)
      if (profileBannerPreview) URL.revokeObjectURL(profileBannerPreview)
    }
  }, [profileImagePreview, profileBannerPreview])

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validation
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    if (formData.password && formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setIsLoading(false)
      return
    }

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("userId", user?.id)
      formDataToSend.append("username", formData.username)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("walletAddress", formData.walletAddress)
      if (formData.password) {
        formDataToSend.append("password", formData.password)
      }
      if (formData.profileImage) {
        formDataToSend.append("profileImage", formData.profileImage)
      }
      if (formData.profileBanner) {
        formDataToSend.append("profileBanner", formData.profileBanner)
      }
      const res = await fetch("/api/user/update", {
        method: "PUT",
        body: formDataToSend,
      })
      if (res.ok) {
        const data = await res.json()
        setSuccess("Profile updated successfully")
        updateUser(data.user)
        if (onProfileUpdated) {
          onProfileUpdated(data.user)
        }
        setTimeout(() => {
          setDialogOpen(false)
          setSuccess("")
        }, 1200)
      } else {
        const data = await res.json()
        setError(data.error || "Update failed")
      }
    } catch (error) {
      setError("An error occurred during update")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start" onClick={() => setDialogOpen(true)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="profileImage">Profile Image</Label>
              <div className="flex items-center space-x-2">
                <div className="relative w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  {profileImagePreview ? (
                    <Image
                      src={profileImagePreview}
                      alt="Profile"
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : currentData?.profileImage ? (
                    <Image
                      src={currentData.profileImage}
                      alt="Profile"
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("profileImage", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("profileImage")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </div>
              </div>
            </div>
            {/* Profile Banner Upload */}
            <div className="space-y-2">
              <Label htmlFor="profileBanner">Profile Banner</Label>
              <div className="flex items-center space-x-2">
                <div className="relative w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                  {profileBannerPreview ? (
                    <Image
                      src={profileBannerPreview}
                      alt="Banner"
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : currentData?.profileBanner ? (
                    <Image
                      src={currentData.profileBanner}
                      alt="Banner"
                      fill
                      className="object-cover rounded-lg"
                    />
                  ) : (
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    id="profileBanner"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange("profileBanner", e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => document.getElementById("profileBanner")?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Banner
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              type="text"
              placeholder="0x..."
              value={formData.walletAddress}
              onChange={(e) => handleInputChange("walletAddress", e.target.value)}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password (Optional)</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
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
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
