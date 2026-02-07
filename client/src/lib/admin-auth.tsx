import { useLocation } from "wouter";
import { useEffect, useState } from "react";

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = localStorage.getItem("adminAuthenticated");
      const loginTime = localStorage.getItem("adminLoginTime");
      
      console.log("[AdminAuth] Checking state:", { authenticated, loginTime });

      if (authenticated === "true" && loginTime) {
        const sessionAge = Date.now() - parseInt(loginTime);
        const sessionValid = sessionAge < 30 * 24 * 60 * 60 * 1000;
        
        if (sessionValid) {
          console.log("[AdminAuth] Session valid, setting authenticated=true");
          setIsAuthenticated(true);
        } else {
          console.log("[AdminAuth] Session expired");
          localStorage.removeItem("adminAuthenticated");
          localStorage.removeItem("adminLoginTime");
          setIsAuthenticated(false);
        }
      } else {
        console.log("[AdminAuth] No session found");
        setIsAuthenticated(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "adminAuthenticated" || e.key === "adminLoginTime") {
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events to handle same-tab updates
    const handleCustomAuthChange = () => {
      checkAuth();
    };
    window.addEventListener('admin-auth-change', handleCustomAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('admin-auth-change', handleCustomAuthChange);
    };
  }, []);

  const logout = () => {
    console.log("[AdminAuth] Logging out");
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