import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              <img src="/images/logo.png" alt="My Green Loop" className="h-16 w-auto" />
            </a>
          </Link>

          <div className="flex items-center space-x-2">
            {/* Admin button - always visible */}
            <Button asChild variant="ghost" size="sm">
              <Link href="/admin/login">
                <Shield className="h-4 w-4 mr-1" />
                Admin
              </Link>
            </Button>
            
            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/catalog">
                <a className="text-sm font-medium text-gray-700 hover:text-green-700">
                  Catalog
                </a>
              </Link>
              <Link href="/reviews">
                <a className="text-sm font-medium text-gray-700 hover:text-green-700">
                  Reviews
                </a>
              </Link>
              <Link href="/feedback">
                <a className="text-sm font-medium text-gray-700 hover:text-green-700">
                  Feedback
                </a>
              </Link>
              <Button asChild variant="outline">
                <Link href="/catalog">Rent Now</Link>
              </Button>
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-md text-gray-700 hover:text-green-700">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
