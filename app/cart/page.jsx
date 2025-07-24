import Header from "../components/layout/header"
import Footer from "../components/layout/footer"
import CartPage from "../components/cart/cart-page"

export default function Cart() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <CartPage />
      </main>
      <Footer />
    </div>
  )
}

