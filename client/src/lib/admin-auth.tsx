import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem("adminAuthenticated");
      const loginTime = localStorage.getItem("adminLoginTime");
      
      if (authenticated === "true" && loginTime) {
        // Session expires after 30 days for better persistent experience
        const sessionAge = Date.now() - parseInt(loginTime);
        const sessionValid = sessionAge < 30 * 24 * 60 * 60 * 1000;
        
        if (sessionValid) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem("adminAuthenticated");
          localStorage.removeItem("adminLoginTime");
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
    
    // Listen for storage changes to sync across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "adminAuthenticated" || e.key === "adminLoginTime") {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem("adminAuthenticated");
    localStorage.removeItem("adminLoginTime");
    setIsAuthenticated(false);
  };

  return { isAuthenticated, isLoading, logout };
}

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}