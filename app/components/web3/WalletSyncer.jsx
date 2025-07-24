"use client"

import { useContext, useEffect } from "react"
import { Web3Context } from "@/app/context/Web3Context"
import { createUser } from "@/lib/api/createUser"

export default function WalletSyncer() {
  const { wallet } = useContext(Web3Context)

  useEffect(() => {
    if (wallet) {
      createUser(wallet).catch((err) => {
        console.error("Failed to sync user to DB:", err)
      })
    }
  }, [wallet])

  return null // no UI needed — this runs silently
}
