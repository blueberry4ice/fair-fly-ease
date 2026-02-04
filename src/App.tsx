import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NewTransaction from "./pages/NewTransaction";
import TransactionHistory from "./pages/TransactionHistory";
import UserManagement from "./pages/admin/UserManagement";
import PromoManagement from "./pages/admin/PromoManagement";
import Monitoring from "./pages/admin/Monitoring";
import EventManagement from "./pages/admin/EventManagement";
import TravelAgentManagement from "./pages/admin/TravelAgentManagement";
import GuaranteedCodeManagement from "./pages/admin/GuaranteedCodeManagement";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected Route wrapper
function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !isAdmin && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Auth Route wrapper (redirects to dashboard if already logged in)
function AuthRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/login" element={<AuthRoute><Login /></AuthRoute>} />
      
      {/* Protected Routes */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/transaction/new" element={<ProtectedRoute><NewTransaction /></ProtectedRoute>} />
      <Route path="/transactions" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['administrator', 'travel_agent_admin']}>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/travel-agents" 
        element={
          <ProtectedRoute allowedRoles={['administrator']}>
            <TravelAgentManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/events" 
        element={
          <ProtectedRoute allowedRoles={['administrator']}>
            <EventManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/promos" 
        element={
          <ProtectedRoute allowedRoles={['administrator']}>
            <PromoManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/codes" 
        element={
          <ProtectedRoute allowedRoles={['administrator']}>
            <GuaranteedCodeManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/monitoring" 
        element={
          <ProtectedRoute allowedRoles={['administrator']}>
            <Monitoring />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DataProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </DataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
