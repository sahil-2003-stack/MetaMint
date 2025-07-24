"use client"

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'

interface User {
  id: string
  email: string
  username?: string
  walletAddress?: string
  membershipTier?: string
  loyaltyPoints?: number
  profileImage?: string
  profileBanner?: string
  createdAt?: string
}

interface UseAuthReturn {
  user: User | null
  isLoading: boolean
  login: (userData: User, token?: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>, token?: string) => void
  token: string | null
}

const AuthContext = createContext<UseAuthReturn | null>(null)

export const useAuth = (): UseAuthReturn => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for user data and token in localStorage on mount
    const storedUser = localStorage.getItem('user')
    const storedToken = localStorage.getItem('token')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        localStorage.removeItem('user')
      }
    }
    if (storedToken) {
      setToken(storedToken)
    }
    setIsLoading(false)
  }, [])

  const login = (userData: User, tokenValue?: string) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    if (tokenValue) {
      setToken(tokenValue)
      localStorage.setItem('token', tokenValue)
    }
    console.log('Auth login set user:', userData)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  // Always overwrite with the latest backend user object if available
  const updateUser = (userData: Partial<User>, tokenValue?: string) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      Object.entries(userData).forEach(([key, value]) => {
        if (value !== undefined) {
          (updatedUser as any)[key] = value
        }
      })
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      if (tokenValue) {
        setToken(tokenValue)
        localStorage.setItem('token', tokenValue)
      }
      console.log('Auth updateUser set user:', updatedUser)
    }
  }

  const value: UseAuthReturn = {
    user,
    isLoading,
    login,
    logout,
    updateUser,
    token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 