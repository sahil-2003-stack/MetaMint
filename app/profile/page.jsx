"use client"

import { useAuth } from "../hooks/useAuth"
import UserProfile from "../components/profile/user-profile"
import Header from "../components/layout/header"
import Footer from "../components/layout/footer"

export default function ProfilePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto py-8 px-4">
            <div className="text-center">Loading...</div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-grow">
          <div className="container mx-auto py-8 px-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
              <p className="text-muted-foreground mb-4">You need to be signed in to view your profile.</p>
              <a href="/auth/signin" className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
                Sign In
              </a>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-grow">
        <UserProfile />
      </main>
      <Footer />
    </div>
  )
}

