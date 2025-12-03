import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Home from "./screens/Home";
import AddCard from "./screens/AddCard";
import CardDetails from "./screens/CardDetails";
import FidelityCardDetails from "./screens/FidelityCardDetails";
import FidelityTransactionHistory from "./screens/FidelityTransactionHistory";
import BusinessReports from "./screens/BusinessReports";
import AutomaticPromotions from "./screens/AutomaticPromotions";
import EarnedPromotions from "./screens/EarnedPromotions";
import ValidateRedemption from "./screens/ValidateRedemption";
import TransactionHistory from "./screens/TransactionHistory";
import Achievements from "./screens/Achievements";
import NearbyStores from "./screens/NearbyStores";
import Profile from "./screens/Profile";
import Settings from "./screens/Settings";
import StorePanel from "./screens/StorePanel";
import StoreClients from "./screens/StoreClients";
import StorePromotions from "./screens/StorePromotions";
import BusinessDashboard from "./screens/BusinessDashboard";
import Promotions from "./screens/Promotions";
import Notifications from "./screens/Notifications";
import Login from "./screens/Login";
import SignUp from "./screens/SignUp";
import NotFound from "./screens/NotFound";
import DocumentationPDF from "./screens/DocumentationPDF";
import InstallApp from "./screens/InstallApp";

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
          <Route path="/business-reports" element={<ProtectedRoute><BusinessReports /></ProtectedRoute>} />
          <Route path="/automatic-promotions" element={<ProtectedRoute><AutomaticPromotions /></ProtectedRoute>} />
          <Route path="/validate-redemption" element={<ProtectedRoute><ValidateRedemption /></ProtectedRoute>} />
          <Route path="/store-panel" element={<ProtectedRoute><StorePanel /></ProtectedRoute>} />
          <Route path="/store-clients" element={<ProtectedRoute><StoreClients /></ProtectedRoute>} />
          <Route path="/store-promotions" element={<ProtectedRoute><StorePromotions /></ProtectedRoute>} />
          <Route path="/promotions" element={<ProtectedRoute><Promotions /></ProtectedRoute>} />
          <Route path="/earned-promotions" element={<ProtectedRoute><EarnedPromotions /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
          <Route path="/add-card" element={<ProtectedRoute><AddCard /></ProtectedRoute>} />
          <Route path="/edit-card/:id" element={<ProtectedRoute><AddCard /></ProtectedRoute>} />
          <Route path="/card/:id" element={<ProtectedRoute><CardDetails /></ProtectedRoute>} />
          <Route path="/fidelity-card/:id" element={<ProtectedRoute><FidelityCardDetails /></ProtectedRoute>} />
          <Route path="/fidelity-card/:id/history" element={<ProtectedRoute><FidelityTransactionHistory /></ProtectedRoute>} />
          <Route path="/card/:id/history" element={<ProtectedRoute><TransactionHistory /></ProtectedRoute>} />
          <Route path="/achievements" element={<ProtectedRoute><Achievements /></ProtectedRoute>} />
          <Route path="/nearby-stores" element={<ProtectedRoute><NearbyStores /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/documentation" element={<DocumentationPDF />} />
          <Route path="/install" element={<InstallApp />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
