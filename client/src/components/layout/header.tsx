import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Shield, LayoutDashboard } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth";

export default function Header() {
  const { isAuthenticated } = useAdminAuth();
  const [location] = useLocation();

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
            {/* Admin button - dynamic based on auth state */}
            {isAuthenticated ? (
              <Button asChild variant="ghost" size="sm" className="text-green-700 bg-green-50">
                <Link href="/admin/orders">
                  <LayoutDashboard className="h-4 w-4 mr-1" />
                  Dashboard
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin/login">
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
              </Button>
            )}

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link href="/resources">
                <a className="text-sm font-medium text-gray-700 hover:text-green-700">
                  Resources
                </a>
              </Link>
              <Link href="/catalog">
                <a className="text-sm font-medium text-gray-700 hover:text-green-700">
                  Catalog
                </a>
              </Link>
              <Link href="/bookmarks">
                <a className="text-sm font-medium text-gray-700 hover:text-green-700 flex items-center gap-1">
                  Saved
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
