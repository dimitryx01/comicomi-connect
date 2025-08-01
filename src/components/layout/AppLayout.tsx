
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import { Routes, Route, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { lazy } from "react";
import { AuthGuard } from "@/components/auth/AuthGuard";

// Lazy load pages
const Index = lazy(() => import("../../pages/Index"));
const Login = lazy(() => import("../../pages/Login"));
const Register = lazy(() => import("../../pages/Register"));
const Feed = lazy(() => import("../../pages/Feed"));
const Profile = lazy(() => import("../../pages/Profile"));
const PublicProfile = lazy(() => import("../../pages/PublicProfile"));
const Settings = lazy(() => import("../../pages/Settings"));
const Onboarding = lazy(() => import("../../pages/Onboarding"));
const Discover = lazy(() => import("../../pages/Discover"));
const Recipes = lazy(() => import("../../pages/Recipes"));
const RecipeDetail = lazy(() => import("../../pages/RecipeDetail"));
const Restaurants = lazy(() => import("../../pages/Restaurants"));
const RestaurantDetail = lazy(() => import("../../pages/RestaurantDetail"));
const Following = lazy(() => import("../../pages/Following"));
const Saved = lazy(() => import("../../pages/Saved"));
const Shopping = lazy(() => import("../../pages/Shopping"));
const Messages = lazy(() => import("../../pages/Messages"));
const PostDetail = lazy(() => import("../../pages/PostDetail"));
const SharedPostDetail = lazy(() => import("../../pages/SharedPostDetail"));
const Notifications = lazy(() => import("../../pages/Notifications"));
const NotFound = lazy(() => import("../../pages/NotFound"));

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  console.log('[DEBUG] AppLayout: Rendering', { isAuthenticated, pathname: location.pathname, isMobile });
  
  // Rutas que deben mostrar la sidebar incluso sin autenticación
  const publicRoutesWithSidebar = ['/discover', '/restaurants', '/recipes'];
  const shouldShowSidebar = (isAuthenticated || publicRoutesWithSidebar.includes(location.pathname)) && !isMobile;

  // Mobile Layout - Full width, no sidebar
  if (isMobile) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex flex-col w-full bg-background">
          <Navbar isAuthenticated={isAuthenticated} />
          <main className="flex-1 overflow-auto pt-14 pb-16">
            <div className="w-full">
              <Routes>
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
              </Routes>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Desktop Layout without sidebar
  if (!shouldShowSidebar) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex w-full bg-background">
          <main className="flex-1 overflow-auto">
            <Navbar isAuthenticated={isAuthenticated} />
            <div className="container py-6 pt-20">
              <Routes>
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
              </Routes>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // Desktop Layout with sidebar
  return (
    <AuthGuard>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background">
          <AppSidebar />
          <main className="flex-1 overflow-auto">
            <Navbar isAuthenticated={isAuthenticated} />
            <div className="container py-6 pt-20">
              <Routes>
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
              </Routes>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </AuthGuard>
  );
}
