// app/layout-client.jsx
"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";
import { Web3Provider } from "./context/Web3Context";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./hooks/useAuth";

export default function LayoutClient({ children }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Web3Provider>
            <CartProvider>
              {children}
            </CartProvider>
          </Web3Provider>
        </AuthProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
