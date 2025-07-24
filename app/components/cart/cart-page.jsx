"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/hooks/useAuth"
import { useToast } from "@/hooks/use-toast"
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { Trash2, ShoppingCart, CreditCard } from "lucide-react"
import Image from "next/image"

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

export default function CartPage() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart()
  const { user, token } = useAuth()
  const { toast } = useToast()
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);

  const handleCheckout = async () => {
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to checkout.", variant: "destructive" });
      return;
    }
    if (cartItems.length === 0) {
      toast({ title: "Empty Cart", description: "Your cart is empty.", variant: "destructive" });
      return;
    }
    const totalAmount = getCartTotal();
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ items: cartItems, totalAmount }),
      });
      const data = await res.json();
      if (res.ok && data.clientSecret) {
        setClientSecret(data.clientSecret);
        setPendingOrder({ items: cartItems, totalAmount });
        setPaymentModalOpen(true);
      } else {
        toast({ title: "Payment Error", description: data.error || "Failed to initiate payment.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Payment Error", description: error.message, variant: "destructive" });
    }
  };

  const handlePaymentSuccess = async (paymentIntent) => {
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
        toast({ title: "Purchase Successful!", description: data.message || "Items purchased successfully!" });
        clearCart(); // Clear cart after successful purchase
      } else {
        toast({ title: "Order Error", description: data.error || "Failed to finalize order.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Order Error", description: error.message, variant: "destructive" });
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <ShoppingCart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Your Cart is Empty</h2>
          <p className="text-muted-foreground mb-4">Add some NFTs to your cart to get started</p>
          <Button onClick={() => window.location.href = "/store"}>
            Browse NFTs
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart}>
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cart Items ({cartItems.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="relative w-20 h-20">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {item.tier}
                        </Badge>
                        {item.isCoreDrop && (
                          <Badge className="bg-primary text-primary-foreground">
                            Core
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{item.price} ETH</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        >
                          -
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between">
                      <span className="text-sm">{item.name} x{item.quantity}</span>
                      <span className="text-sm font-medium">
                        {(parseFloat(item.price) * item.quantity).toFixed(4)} ETH
                      </span>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{getCartTotal().toFixed(4)} ETH</span>
                </div>
                <Button className="w-full" onClick={handleCheckout}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <PaymentModal 
          open={paymentModalOpen} 
          onClose={() => setPaymentModalOpen(false)} 
          clientSecret={clientSecret} 
          onPaymentSuccess={handlePaymentSuccess} 
        />
      </div>
    </Elements>
  )
}

