import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Emergency from "./pages/Emergency";
import ProviderProfile from "./pages/ProviderProfile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminPanel from "./pages/AdminPanel";
import ProviderDashboard from "./pages/ProviderDashboard";
import ProviderServices from "./pages/ProviderServices";
import ProviderBookings from "./pages/ProviderBookings";
import MyBookings from "./pages/MyBookings";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { useAppStore } from "./store/useAppStore";
import { authAPI } from "./lib/api";
import "./i18n";

const queryClient = new QueryClient();

// Component to initialize auth state
function AuthInitializer() {
  const { setUser } = useAppStore();

  useEffect(() => {
    // Try to load user from token on mount
    const loadUser = async () => {
      try {
        const user = await authAPI.getCurrentUser();
        setUser({
          id: user._id || user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePicture: user.profilePicture || undefined,
          location: user.location?.coordinates
            ? {
              lat: user.location.coordinates[1],
              lng: user.location.coordinates[0],
              address: user.address,
            }
            : undefined,
        });
      } catch (error) {
        // Token invalid or expired, clear user
        setUser(null);
      }
    };

    loadUser();
  }, [setUser]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/search" element={<Search />} />
          <Route path="/emergency" element={<Emergency />} />
          <Route path="/provider/:id" element={<ProviderProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/services"
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/bookings"
            element={
              <ProtectedRoute requiredRole="provider">
                <ProviderBookings />
              </ProtectedRoute>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
