// File: app/layout.jsx

import "../styles/globals.css";
import { Inter } from "next/font/google";
import LayoutClient from "./layout-client"; // 👈 Client-side wrapper

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "NFT Membership & Loyalty System",
  description: "Exclusive NFT-based membership and loyalty program",
  generator: "v0.dev",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <LayoutClient>{children}</LayoutClient>
      </body>
    </html>
  );
}
