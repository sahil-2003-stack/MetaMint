import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Award, ChevronRight, Gift, Layers } from "lucide-react"
import Header from "./components/layout/header"
import Footer from "./components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />

      <main className="flex-grow pb-20">
        <div className="bg-gradient-to-b from-purple-50 to-transparent dark:from-purple-950/20 dark:to-transparent py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12 max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
                NFT Membership & Loyalty System
              </h1>
              <p className="text-xl text-muted-foreground">
                Join our exclusive membership program and earn rewards through our NFT-based loyalty system
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center mb-12">
              <Link href="/membership">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none"
                >
                  View Membership Tiers
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href="/store">
                <Button size="lg" variant="outline">
                  Browse NFT Store
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <h2 className="text-3xl font-bold mb-8 text-center">How It Works</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card rounded-xl p-8 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Award className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Exclusive Membership</h3>
              <p className="text-muted-foreground">
                Mint your membership NFT and unlock exclusive benefits and discounts based on your tier level
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Gift className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Earn Loyalty Points</h3>
              <p className="text-muted-foreground">
                Earn points through purchases and engagement that can be redeemed for exclusive rewards and discounts
              </p>
            </div>

            <div className="bg-card rounded-xl p-8 text-center shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Layers className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Collect Unique NFTs</h3>
              <p className="text-muted-foreground">
                Browse and collect unique NFTs that provide special benefits, access to events, and exclusive content
              </p>
            </div>
          </div>

          <div className="bg-card rounded-xl p-8 border border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold mb-4">Ready to join our community?</h2>
                <p className="text-muted-foreground mb-6">
                  Start your journey with our NFT membership program today and unlock a world of exclusive benefits,
                  rewards, and opportunities.
                </p>
                <Link href="/membership">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-none">
                    Get Started
                  </Button>
                </Link>
              </div>
              <div className="bg-muted rounded-xl p-6 aspect-video flex items-center justify-center">
                <p className="text-muted-foreground text-center">Promotional Video or Animation</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}