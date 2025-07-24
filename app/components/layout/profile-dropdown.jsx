"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, LogOut, Settings, Wallet } from "lucide-react"
import { useAuth } from "@/app/hooks/useAuth"

export default function ProfileDropdown() {
  const { user, isLoading, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    logout()
    window.location.href = "/"
  }

  if (isLoading) {
    return (
      <Button variant="outline" size="icon" disabled>
        <User className="h-5 w-5" />
      </Button>
    )
  }

  if (!user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <User className="h-5 w-5" />
        </Button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-background border rounded-md shadow-lg z-50">
            <div className="py-1">
              <Link href="/auth/signin">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="ghost" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.profileImage || "/placeholder-user.jpg"} alt={user?.username || "User"} />
          <AvatarFallback>
            {(user?.username || user?.email || "U").substring(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-background border rounded-md shadow-lg z-50">
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.profileImage || "/placeholder-user.jpg"} alt={user?.username || "User"} />
                <AvatarFallback>
                  {(user?.username || user?.email || "U").substring(0, 1).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
                <div className="flex items-center mt-1">
                  <Wallet className="h-3 w-3 mr-1 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.walletAddress ? `${user.walletAddress.slice(0, 6)}...${user.walletAddress.slice(-4)}` : "No wallet"}
                  </p>
                </div>
                <Badge variant="secondary" className="mt-1 text-xs">
                  {user?.membershipTier || "Bronze"} Member
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="py-1">
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                View Profile
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 