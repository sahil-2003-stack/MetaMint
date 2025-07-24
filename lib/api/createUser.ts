export async function createUser(walletAddress: string) {
  const res = await fetch("/api/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ walletAddress }),
  })

  if (!res.ok) {
    throw new Error("Failed to create user")
  }

  return res.json()
}
