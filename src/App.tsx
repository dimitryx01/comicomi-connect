
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireOnboarding } from "@/components/auth/RequireOnboarding";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

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
            <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Index />} />
                  <Route path="login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
                  <Route path="register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
                  <Route path="onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
                  <Route path="feed" element={<RequireAuth><RequireOnboarding><Feed /></RequireOnboarding></RequireAuth>} />
                  <Route path="profile" element={<RequireAuth><RequireOnboarding><Profile /></RequireOnboarding></RequireAuth>} />
                  <Route path="profile/:username" element={<PublicProfile />} />
                  <Route path="settings" element={<RequireAuth><RequireOnboarding><Settings /></RequireOnboarding></RequireAuth>} />
                  <Route path="discover" element={<Discover />} />
                  <Route path="recipes" element={<Recipes />} />
                  <Route path="recipes/:id" element={<RecipeDetail />} />
                  <Route path="restaurants" element={<Restaurants />} />
                  <Route path="restaurants/:id" element={<RestaurantDetail />} />
                  <Route path="following" element={<RequireAuth><RequireOnboarding><Following /></RequireOnboarding></RequireAuth>} />
                  <Route path="saved" element={<RequireAuth><RequireOnboarding><Saved /></RequireOnboarding></RequireAuth>} />
                  <Route path="shopping" element={<RequireAuth><RequireOnboarding><Shopping /></RequireOnboarding></RequireAuth>} />
                  <Route path="messages" element={<RequireAuth><RequireOnboarding><Messages /></RequireOnboarding></RequireAuth>} />
                  <Route path="notifications" element={<RequireAuth><RequireOnboarding><Notifications /></RequireOnboarding></RequireAuth>} />
                  <Route path="post/:postId" element={<PostDetail />} />
                  <Route path="shared-post/:sharedPostId" element={<SharedPostDetail />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
