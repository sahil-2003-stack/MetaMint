"use client"

import { useState, useEffect, useContext } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "../theme/theme-toggle"
import { Web3Context } from "@/app/context/Web3Context"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/hooks/useAuth"
import WalletSyncer from "@/app/components/web3/WalletSyncer"
import ProfileDropdown from "./profile-dropdown"
import { ShoppingCart, Layers, Menu, Home, Award, Gift, ShoppingBag, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

export default function Header() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const { wallet, connectWallet } = useContext(Web3Context)
  const { cartCount } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navItems = [
    { name: "Home", path: "/", icon: <Home className="h-5 w-5" /> },
    { name: "Membership", path: "/membership", icon: <Award className="h-5 w-5" /> },
    { name: "NFTs", path: "/nfts", icon: <Layers className="h-5 w-5" /> },
    { name: "Loyalty", path: "/loyalty", icon: <Gift className="h-5 w-5" /> },
    { name: "Store", path: "/store", icon: <ShoppingBag className="h-5 w-5" /> },
  ]

  const handleConnectWallet = () => {
    connectWallet()
  }

  return (
    <>
      <WalletSyncer />

      <header className={`border-b sticky top-0 bg-background/80 backdrop-blur-md z-10 transition-all duration-200 ${scrolled ? "shadow-sm" : ""}`}>
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg"><Layers className="h-6 w-6 text-white" /></div>
            <h1 className="text-xl font-bold">NFT Membership</h1>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link href={item.path} key={item.path}>
                <Button variant={pathname === item.path ? "default" : "ghost"} size="sm">{item.name}</Button>
              </Link>
            ))}

            {/* Always show Connect Wallet button */}
            <Button 
              onClick={handleConnectWallet} 
              variant={wallet ? "outline" : "default"} 
              size="sm" 
              className={wallet ? "" : "bg-gradient-to-r from-purple-600 to-pink-600 text-white"}
              title={wallet ? "Wallet connected" : "Connect your wallet"}
            >
              <Wallet className="h-4 w-4 mr-1" />
              {wallet ? "Connected" : "Connect Wallet"}
            </Button>
          </div>

          {/* Mobile + Theme + Cart + Profile */}
          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Link href="/cart">
              <div className="relative">
                <Button variant="outline" size="icon"><ShoppingCart className="h-5 w-5" /></Button>
                {cartCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-purple-600">{cartCount}</Badge>}
              </div>
            </Link>

            {/* Profile Dropdown */}
            <ProfileDropdown />

            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <Link href={item.path} key={item.path}>
                        <Button 
                          variant={pathname === item.path ? "default" : "ghost"} 
                          className="w-full justify-start"
                        >
                          {item.icon}
                          <span className="ml-2">{item.name}</span>
                        </Button>
                      </Link>
                    ))}
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    onClick={handleConnectWallet} 
                    variant={wallet ? "outline" : "default"} 
                    className="w-full justify-start"
                    title={wallet ? "Wallet connected" : "Connect your wallet"}
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {wallet ? "Wallet Connected" : "Connect Wallet"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  )
}
