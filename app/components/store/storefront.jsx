"use client"

import { useState, useEffect, useContext } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Filter, Search, ExternalLink, Crown, Users, Gift, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Web3Context } from "@/app/context/Web3Context"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/hooks/useAuth"
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function PaymentModal({ open, onClose, clientSecret, onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError("");
    if (!stripe || !elements) return;
    const cardElement = elements.getElement(CardElement);
    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });
    if (stripeError) {
      setError(stripeError.message);
      setIsProcessing(false);
      return;
    }
    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onPaymentSuccess(paymentIntent);
      onClose();
    } else {
      setError('Payment failed.');
    }
    setIsProcessing(false);
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Complete Payment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardElement options={{ hidePostalCode: true }} />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <div className="flex gap-2 mt-4">
            <Button type="submit" disabled={isProcessing} className="flex-1">
              {isProcessing ? 'Processing...' : 'Pay'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Storefront() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("featured")
  const [loading, setLoading] = useState(true)
  const [coreDrops, setCoreDrops] = useState([])
  const [partnerDrops, setPartnerDrops] = useState([])
  const [loyaltyPoints, setLoyaltyPoints] = useState(0)
  const [userTier, setUserTier] = useState(null)
  const [purchasing, setPurchasing] = useState(null)
  const { wallet, contract } = useContext(Web3Context)
  const { addToCart } = useCart()
  const { toast } = useToast()
  const { user, token } = useAuth()
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => {
    fetchStoreData()
  }, [])

  const fetchStoreData = async () => {
    setLoading(true)
    try {
      // Fetch core drops and partner drops in parallel
      const [coreResponse, partnerResponse, loyaltyResponse] = await Promise.all([
        fetch('/api/nft/list-drops'),
        fetch('/api/nft/list-partner-drops'),
        fetch('/api/loyalty/points')
      ])

      if (coreResponse.ok) {
        const coreData = await coreResponse.json()
        setCoreDrops(coreData.drops || [])
      }

      if (partnerResponse.ok) {
        const partnerData = await partnerResponse.json()
        setPartnerDrops(partnerData.drops || [])
      }

      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json()
        setLoyaltyPoints(loyaltyData.points || 0)
        setUserTier(loyaltyData.tier)
      }
    } catch (error) {
      console.error('Error fetching store data:', error)
      toast({
        title: "Error",
        description: "Failed to load store data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const allProducts = [...coreDrops, ...partnerDrops]

  const filteredProducts = allProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === "featured") {
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
    } else if (sortOption === "price-low") {
      return parseFloat(a.price) - parseFloat(b.price)
    } else if (sortOption === "price-high") {
      return parseFloat(b.price) - parseFloat(a.price)
    } else if (sortOption === "name") {
      return a.name.localeCompare(b.name)
    }
    return 0
  })

  const handleAddToCart = (product) => {
    addToCart(product)
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    })
  }

  const handleBuyNow = async (product) => {
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to purchase NFTs.", variant: "destructive" });
      return;
    }
    if (!wallet) {
      toast({ title: "Wallet Required", description: "Please connect your wallet to make a purchase", variant: "destructive" });
      return;
    }
    // Prepare checkout data
    const items = [{ ...product, quantity: 1 }];
    const totalAmount = parseFloat(product.price);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ items, totalAmount }),
      });
      const data = await res.json();
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPendingOrder({ items, totalAmount });
        setPaymentModalOpen(true);
      } else {
        toast({ title: "Payment Error", description: data.error || "Failed to initiate payment.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Payment Error", description: error.message, variant: "destructive" });
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
    // Call backend to finalize order, update DB, loyalty, etc.
    try {
      const res = await fetch('/api/checkout/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          items: pendingOrder.items,
          totalAmount: pendingOrder.totalAmount,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Purchase Successful!", description: data.message || "NFT purchased successfully!" });
        // Optionally refresh loyalty points, cart, etc.
      } else {
        toast({ title: "Order Error", description: data.error || "Failed to finalize order.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Order Error", description: error.message, variant: "destructive" });
    }
  };

  const handleViewExternal = (product) => {
    if (product.metadata?.externalUrl) {
      window.open(product.metadata.externalUrl, '_blank')
    } else {
      toast({
        title: "External Link",
        description: "No external link available for this item",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">NFT Marketplace</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Loading marketplace...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="w-full aspect-square bg-muted rounded mb-3"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="container mx-auto py-8 px-4 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">NFT Marketplace</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">Browse and purchase exclusive NFTs and digital assets</p>
          
          {/* Loyalty Points Display */}
          <div className="mt-4 flex items-center justify-center gap-4">
            <div className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
              <Gift className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">{loyaltyPoints} points</span>
            </div>
            {userTier && (
              <Badge variant="secondary">
                {userTier.charAt(0).toUpperCase() + userTier.slice(1)} Tier
              </Badge>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={() => toast({
              title: "Filters",
              description: "Advanced filters coming soon!",
            })}>
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full max-w-xs sm:max-w-md mx-auto grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="core">Core Drops</TabsTrigger>
            <TabsTrigger value="partner">Partner</TabsTrigger>
            <TabsTrigger value="membership">Membership</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => handleAddToCart(product)}
                  onPurchase={() => handleBuyNow(product)}
                  onViewExternal={() => handleViewExternal(product)}
                  purchasing={purchasing === product.id}
                  loyaltyPoints={loyaltyPoints}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="core" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts
                .filter((product) => product.isCoreDrop)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onPurchase={() => handleBuyNow(product)}
                    onViewExternal={() => handleViewExternal(product)}
                    purchasing={purchasing === product.id}
                    loyaltyPoints={loyaltyPoints}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="partner" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts
                .filter((product) => product.isPartnerDrop)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onPurchase={() => handleBuyNow(product)}
                    onViewExternal={() => handleViewExternal(product)}
                    purchasing={purchasing === product.id}
                    loyaltyPoints={loyaltyPoints}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="membership" className="mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts
                .filter((product) => product.isMembership)
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={() => handleAddToCart(product)}
                    onPurchase={() => handleBuyNow(product)}
                    onViewExternal={() => handleViewExternal(product)}
                    purchasing={purchasing === product.id}
                    loyaltyPoints={loyaltyPoints}
                  />
                ))}
            </div>
          </TabsContent>
        </Tabs>
        <PaymentModal open={paymentModalOpen} onClose={() => setPaymentModalOpen(false)} clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
      </div>
    </Elements>
  )
}

function ProductCard({ product, onAddToCart, onPurchase, onViewExternal, purchasing, loyaltyPoints }) {
  const maxPointsToUse = Math.min(loyaltyPoints, 1000)
  const pointsValue = maxPointsToUse * 0.0001
  const discountedPrice = Math.max(parseFloat(product.price) - pointsValue, 0)

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <div className="relative aspect-square">
        <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
        <div className="absolute top-2 right-2 flex gap-1">
          {product.isCoreDrop && (
            <Badge className="bg-primary text-primary-foreground">
              <Crown className="h-3 w-3 mr-1" />
              Core
            </Badge>
          )}
          {product.isPartnerDrop && (
            <Badge variant="secondary">
              <ExternalLink className="h-3 w-3 mr-1" />
              Partner
            </Badge>
          )}
          {product.isMembership && (
            <Badge variant="outline">
              <Users className="h-3 w-3 mr-1" />
              Membership
            </Badge>
          )}
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xl font-bold">{product.price} ETH</p>
            {maxPointsToUse > 0 && (
              <p className="text-sm text-green-600 dark:text-green-400">
                With points: {discountedPrice.toFixed(4)} ETH
              </p>
            )}
          </div>
          <div className="text-right">
            <Badge variant="outline" className="capitalize">
              {product.tier}
            </Badge>
            {product.partnerSource && (
              <p className="text-xs text-muted-foreground mt-1">
                via {product.partnerSource}
              </p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          className="flex-1" 
          onClick={onPurchase}
          disabled={purchasing}
        >
          {purchasing ? "Processing..." : "Buy Now"}
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onAddToCart}
        >
          <Plus className="h-4 w-4" />
        </Button>
        {product.isPartnerDrop && (
          <Button
            variant="outline"
            size="icon"
            onClick={onViewExternal}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

