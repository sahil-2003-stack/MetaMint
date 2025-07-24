import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

console.log("🔧 NextAuth route loaded with options:", {
  hasProviders: !!authOptions.providers,
  providerCount: authOptions.providers?.length,
  hasSecret: !!authOptions.secret,
  debug: authOptions.debug
});

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
