import { prisma } from "./db"
import bcrypt from "bcrypt"

export const authOptions = {
  debug: true,
  providers: [
    {
      id: "credentials",
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔍 NextAuth authorize called with:", { email: credentials?.email, hasPassword: !!credentials?.password });
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Missing credentials");
          return null;
        }

        try {
          const user = await prisma.user.findFirst({
            where: { email: credentials.email },
          });

          console.log("👤 User found:", user ? "Yes" : "No");
          if (user) {
            console.log("📝 User details:", { id: user.id, email: user.email, hasPassword: !!user.password });
          }

          if (!user || !user.password) {
            console.log("❌ User not found or no password");
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log("🔐 Password valid:", isValid);

          if (!isValid) {
            console.log("❌ Invalid password");
            return null;
          }

          const { password, ...userWithoutPassword } = user;
          console.log("✅ Returning user:", { id: userWithoutPassword.id, email: userWithoutPassword.email });
          return userWithoutPassword;
        } catch (error) {
          console.error("💥 Auth error:", error);
          return null;
        }
      },
    },
  ],
  pages: {
    signIn: "/auth/signin",
    signOut: "/auth/signout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      console.log("🔄 JWT callback:", { tokenId: token?.id, userId: user?.id });
      if (user) {
        token.id = user.id;
        token.walletAddress = user.walletAddress;
        token.username = user.username;
        token.membershipTier = user.membershipTier;
        token.loyaltyPoints = user.loyaltyPoints;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🔄 Session callback:", { sessionUserId: session?.user?.id, tokenId: token?.id });
      if (session.user && token) {
        session.user.id = token.id;
        session.user.walletAddress = token.walletAddress;
        session.user.username = token.username;
        session.user.membershipTier = token.membershipTier;
        session.user.loyaltyPoints = token.loyaltyPoints;
      }
      return session;
    },
  },
} 