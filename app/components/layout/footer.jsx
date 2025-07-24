import Link from "next/link"
import { Layers } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t mt-12 bg-muted/30">
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-2 rounded-lg">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-bold">NFT Membership</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              The next generation of membership and loyalty programs powered by blockchain technology.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Membership</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/membership" className="text-muted-foreground hover:text-foreground">
                  Tiers & Benefits
                </Link>
              </li>
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/redirects/faq" className="text-muted-foreground hover:text-foreground">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/redirects/docs" className="text-muted-foreground hover:text-foreground">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/redirects/blog" className="text-muted-foreground hover:text-foreground">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/redirects/community" className="text-muted-foreground hover:text-foreground">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/redirects/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/redirects/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/redirects/cookies" className="text-muted-foreground hover:text-foreground">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            &copy; 2023 NFT Membership. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              {/* Twitter Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775..."></path>
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              {/* GitHub Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12..."></path>
              </svg>
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-foreground">
              {/* Instagram Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07..."></path>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
