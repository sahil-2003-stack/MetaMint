import Header from "../components/layout/header"
import Footer from "../components/layout/footer"
import Storefront from "../components/store/storefront"

// Update the store page to account for the bottom navigation padding
export default function StorePage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <Storefront />
      </main>
      <Footer />
    </div>
  )
}

