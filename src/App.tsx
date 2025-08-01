
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { MainAppProvider } from "@/components/providers/MainAppProvider";
import { AdminAppProvider } from "@/components/providers/AdminAppProvider";
import { AppLayout } from "@/components/layout/AppLayout";

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Feed = lazy(() => import("./pages/Feed"));
const Profile = lazy(() => import("./pages/Profile"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Settings = lazy(() => import("./pages/Settings"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Discover = lazy(() => import("./pages/Discover"));
const Recipes = lazy(() => import("./pages/Recipes"));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail"));
const Restaurants = lazy(() => import("./pages/Restaurants"));
const RestaurantDetail = lazy(() => import("./pages/RestaurantDetail"));
const Following = lazy(() => import("./pages/Following"));
const Saved = lazy(() => import("./pages/Saved"));
const Shopping = lazy(() => import("./pages/Shopping"));
const Messages = lazy(() => import("./pages/Messages"));
const PostDetail = lazy(() => import("./pages/PostDetail"));
const SharedPostDetail = lazy(() => import("./pages/SharedPostDetail"));
const Notifications = lazy(() => import("./pages/Notifications"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages - Direct imports to avoid lazy loading issues
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import Reports from "./pages/admin/Reports";
import Establishments from "./pages/admin/Establishments";
import Support from "./pages/admin/Support";
import AuditLogs from "./pages/admin/AuditLogs";
import AdminLayout from "./components/admin/AdminLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  console.log('[DEBUG] App: Initializing application');
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Routes>
                {/* Admin Routes */}
                <Route path="/control-admin/*" element={
                  <ErrorBoundary>
                    <AdminAppProvider>
                      <Routes>
                        <Route path="login" element={<AdminLogin />} />
                        <Route path="/" element={<AdminLayout />}>
                          <Route path="dashboard" element={<AdminDashboard />} />
                          <Route path="admin-users" element={<AdminUsers />} />
                          <Route path="reportes" element={<Reports />} />
                          <Route path="establecimientos" element={<Establishments />} />
                          <Route path="soporte" element={<Support />} />
                          <Route path="auditoria" element={<AuditLogs />} />
                        </Route>
                      </Routes>
                    </AdminAppProvider>
                  </ErrorBoundary>
                } />
                
                {/* Main App Routes */}
                <Route path="/*" element={
                  <ErrorBoundary>
                    <MainAppProvider>
                      <AppLayout />
                    </MainAppProvider>
                  </ErrorBoundary>
                } />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
