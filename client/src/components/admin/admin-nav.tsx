import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/lib/admin-auth";
import { Package, Bell, BarChart, LogOut } from "lucide-react";

export default function AdminNav() {
  const [location] = useLocation();
  const { logout } = useAdminAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const navItems = [
    { href: "/admin/orders", label: "Orders", icon: Package },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/dashboard", label: "Inventory", icon: BarChart },
  ];

  return (
    <div className="bg-white border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-6">
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
            <nav className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <a
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-green-100 text-green-700"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}