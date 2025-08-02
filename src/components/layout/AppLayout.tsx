
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import { Routes, Route, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { lazy } from "react";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { RequireOnboarding } from "@/components/auth/RequireOnboarding";
import { RedirectIfAuthenticated } from "@/components/auth/RedirectIfAuthenticated";

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

// Legal pages
const PrivacyPolicy = lazy(() => import("../../pages/legal/PrivacyPolicy"));
const TermsConditions = lazy(() => import("../../pages/legal/TermsConditions"));
const CookiesPolicy = lazy(() => import("../../pages/legal/CookiesPolicy"));
const LegalNotice = lazy(() => import("../../pages/legal/LegalNotice"));
const Contact = lazy(() => import("../../pages/Contact"));

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  console.log('[DEBUG] AppLayout: Rendering', { isAuthenticated, pathname: location.pathname, isMobile });
  
  // Rutas que deben mostrar la sidebar incluso sin autenticación
  const publicRoutesWithSidebar = ['/discover', '/restaurants', '/recipes'];
  const isPublicDetailRoute = location.pathname.startsWith('/recipes/') || location.pathname.startsWith('/restaurants/');
  const shouldShowSidebar = (isAuthenticated || publicRoutesWithSidebar.includes(location.pathname) || isPublicDetailRoute) && !isMobile;

  // Mobile Layout - Full width, no sidebar
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Navbar isAuthenticated={isAuthenticated} />
        <main className="flex-1 overflow-auto pt-14 pb-16">
          <div className="w-full">
            <Routes>
              <Route index element={<Index />} />
              <Route path="login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
              <Route path="register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
              <Route path="feed" element={<RequireAuth><RequireOnboarding><Feed /></RequireOnboarding></RequireAuth>} />
              <Route path="profile" element={<RequireAuth><RequireOnboarding><Profile /></RequireOnboarding></RequireAuth>} />
              <Route path="profile/:username" element={<PublicProfile />} />
              <Route path="settings" element={<RequireAuth><RequireOnboarding><Settings /></RequireOnboarding></RequireAuth>} />
              <Route path="onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
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
              <Route path="politica-privacidad" element={<PrivacyPolicy />} />
              <Route path="terminos-condiciones" element={<TermsConditions />} />
              <Route path="politica-cookies" element={<CookiesPolicy />} />
              <Route path="aviso-legal" element={<LegalNotice />} />
              <Route path="contactanos" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    );
  }

  // Desktop Layout without sidebar
  if (!shouldShowSidebar) {
    return (
      <div className="min-h-screen flex w-full bg-background">
        <main className="flex-1 overflow-auto">
          <Navbar isAuthenticated={isAuthenticated} />
          <div className={location.pathname === '/' ? "pt-20" : "container py-6 pt-20"}>
            <Routes>
              <Route index element={<Index />} />
              <Route path="login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
              <Route path="register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
              <Route path="feed" element={<RequireAuth><RequireOnboarding><Feed /></RequireOnboarding></RequireAuth>} />
              <Route path="profile" element={<RequireAuth><RequireOnboarding><Profile /></RequireOnboarding></RequireAuth>} />
              <Route path="profile/:username" element={<PublicProfile />} />
              <Route path="settings" element={<RequireAuth><RequireOnboarding><Settings /></RequireOnboarding></RequireAuth>} />
              <Route path="onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
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
              <Route path="politica-privacidad" element={<PrivacyPolicy />} />
              <Route path="terminos-condiciones" element={<TermsConditions />} />
              <Route path="politica-cookies" element={<CookiesPolicy />} />
              <Route path="aviso-legal" element={<LegalNotice />} />
              <Route path="contactanos" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    );
  }

  // Desktop Layout with sidebar
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <Navbar isAuthenticated={isAuthenticated} />
          <div className={location.pathname === '/' ? "pt-20" : "container py-6 pt-20"}>
            <Routes>
              <Route index element={<Index />} />
              <Route path="login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />
              <Route path="register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
              <Route path="feed" element={<RequireAuth><RequireOnboarding><Feed /></RequireOnboarding></RequireAuth>} />
              <Route path="profile" element={<RequireAuth><RequireOnboarding><Profile /></RequireOnboarding></RequireAuth>} />
              <Route path="profile/:username" element={<PublicProfile />} />
              <Route path="settings" element={<RequireAuth><RequireOnboarding><Settings /></RequireOnboarding></RequireAuth>} />
              <Route path="onboarding" element={<RequireAuth><Onboarding /></RequireAuth>} />
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
                <Route path="politica-privacidad" element={<PrivacyPolicy />} />
                <Route path="terminos-condiciones" element={<TermsConditions />} />
                <Route path="politica-cookies" element={<CookiesPolicy />} />
                <Route path="aviso-legal" element={<LegalNotice />} />
                <Route path="contactanos" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
