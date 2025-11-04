import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Home from "./pages/Home";
import AddCard from "./pages/AddCard";
import CardDetails from "./pages/CardDetails";
import TransactionHistory from "./pages/TransactionHistory";
import Achievements from "./pages/Achievements";
import NearbyStores from "./pages/NearbyStores";
import Profile from "./pages/Profile";
import StorePanel from "./pages/StorePanel";
import StoreClients from "./pages/StoreClients";
import StorePromotions from "./pages/StorePromotions";
import BusinessDashboard from "./pages/BusinessDashboard";
import Promotions from "./pages/Promotions";
import Notifications from "./pages/Notifications";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const HomeRedirect = () => {
  const { currentUser } = useAuth();
  
  if (currentUser?.accountType === 'business') {
    return <Navigate to="/business-dashboard" replace />;
  }
  
  return <Home />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/" element={<ProtectedRoute><HomeRedirect /></ProtectedRoute>} />
          <Route path="/business-dashboard" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
          <Route path="/store-panel" element={<ProtectedRoute><StorePanel /></ProtectedRoute>} />
          <Route path="/store-clients" element={<ProtectedRoute><StoreClients /></ProtectedRoute>} />
          <Route path="/store-promotions" element={<ProtectedRoute><StorePromotions /></ProtectedRoute>} />
          <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/add-card" element={<ProtectedRoute><AddCard /></ProtectedRoute>} />
          <Route path="/edit-card/:id" element={<ProtectedRoute><AddCard /></ProtectedRoute>} />
          <Route path="/card/:id" element={<ProtectedRoute><CardDetails /></ProtectedRoute>} />
          <Route path="/card/:id/history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/nearby-stores" element={<ProtectedRoute><NearbyStores /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
