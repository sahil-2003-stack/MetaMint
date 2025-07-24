import Header from "../components/layout/header"
import Footer from "../components/layout/footer"
import MembershipTiers from "../components/membership/membership-tiers"

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <MembershipTiers />
      </main>
      <Footer />
    </div>
  )
}

