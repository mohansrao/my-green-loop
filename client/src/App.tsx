import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Catalog from "@/pages/catalog";
import Checkout from "@/pages/checkout";
import ThankYou from "@/pages/thank-you";
import InventoryDashboard from "@/pages/admin/inventory-dashboard";
import NotificationsDashboard from "@/pages/admin/notifications";
import OrdersPage from "@/pages/admin/orders";
import AdminLogin from "@/pages/admin/login";
import { ProtectedAdminRoute } from "@/lib/admin-auth";
import Layout from "@/components/layout/layout";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/catalog" component={Catalog} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/thank-you" component={ThankYou} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard">
        <ProtectedAdminRoute>
          <InventoryDashboard />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin/notifications">
        <ProtectedAdminRoute>
          <NotificationsDashboard />
        </ProtectedAdminRoute>
      </Route>
      <Route path="/admin/orders">
        <ProtectedAdminRoute>
          <OrdersPage />
        </ProtectedAdminRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Layout>
        <Router />
      </Layout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;