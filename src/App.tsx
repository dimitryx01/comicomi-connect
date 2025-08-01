
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
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

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const Reports = lazy(() => import("./pages/admin/Reports"));
const Establishments = lazy(() => import("./pages/admin/Establishments"));
const Support = lazy(() => import("./pages/admin/Support"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AdminAuthProvider>
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/control-admin/login" element={<AdminLogin />} />
                  <Route path="/control-admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="admin-users" element={<AdminUsers />} />
                    <Route path="reportes" element={<Reports />} />
                    <Route path="establecimientos" element={<Establishments />} />
                    <Route path="soporte" element={<Support />} />
                    <Route path="auditoria" element={<AuditLogs />} />
                  </Route>
                  
                  {/* Main App Routes */}
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Index />} />
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="feed" element={<Feed />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="profile/:username" element={<PublicProfile />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="onboarding" element={<Onboarding />} />
                    <Route path="discover" element={<Discover />} />
                    <Route path="recipes" element={<Recipes />} />
                    <Route path="recipes/:id" element={<RecipeDetail />} />
                    <Route path="restaurants" element={<Restaurants />} />
                    <Route path="restaurants/:id" element={<RestaurantDetail />} />
                    <Route path="following" element={<Following />} />
                    <Route path="saved" element={<Saved />} />
                    <Route path="shopping" element={<Shopping />} />
                    <Route path="messages" element={<Messages />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="post/:postId" element={<PostDetail />} />
                    <Route path="shared-post/:sharedPostId" element={<SharedPostDetail />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </AdminAuthProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
