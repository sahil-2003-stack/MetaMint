import Header from "../components/layout/header"
import Footer from "../components/layout/footer"
import LoyaltyDashboard from "../components/loyalty/loyalty-dashboard"

export default function LoyaltyPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <LoyaltyDashboard />
      </main>
      <Footer />
    </div>
  )
}

