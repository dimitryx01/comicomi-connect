
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";

// Lazy load pages with better error handling
const Index = lazy(() => import("./pages/Index").catch(() => ({ default: () => <div>Error loading page</div> })));
const Login = lazy(() => import("./pages/Login").catch(() => ({ default: () => <div>Error loading page</div> })));
const Register = lazy(() => import("./pages/Register").catch(() => ({ default: () => <div>Error loading page</div> })));
const Feed = lazy(() => import("./pages/Feed").catch(() => ({ default: () => <div>Error loading page</div> })));
const Profile = lazy(() => import("./pages/Profile").catch(() => ({ default: () => <div>Error loading page</div> })));
const PublicProfile = lazy(() => import("./pages/PublicProfile").catch(() => ({ default: () => <div>Error loading page</div> })));
const Settings = lazy(() => import("./pages/Settings").catch(() => ({ default: () => <div>Error loading page</div> })));
const Onboarding = lazy(() => import("./pages/Onboarding").catch(() => ({ default: () => <div>Error loading page</div> })));
const Discover = lazy(() => import("./pages/Discover").catch(() => ({ default: () => <div>Error loading page</div> })));
const Recipes = lazy(() => import("./pages/Recipes").catch(() => ({ default: () => <div>Error loading page</div> })));
const RecipeDetail = lazy(() => import("./pages/RecipeDetail").catch(() => ({ default: () => <div>Error loading page</div> })));
const Restaurants = lazy(() => import("./pages/Restaurants").catch(() => ({ default: () => <div>Error loading page</div> })));
const RestaurantDetail = lazy(() => import("./pages/RestaurantDetail").catch(() => ({ default: () => <div>Error loading page</div> })));
const Following = lazy(() => import("./pages/Following").catch(() => ({ default: () => <div>Error loading page</div> })));
const Saved = lazy(() => import("./pages/Saved").catch(() => ({ default: () => <div>Error loading page</div> })));
const Shopping = lazy(() => import("./pages/Shopping").catch(() => ({ default: () => <div>Error loading page</div> })));
const Messages = lazy(() => import("./pages/Messages").catch(() => ({ default: () => <div>Error loading page</div> })));
const PostDetail = lazy(() => import("./pages/PostDetail").catch(() => ({ default: () => <div>Error loading page</div> })));
const SharedPostDetail = lazy(() => import("./pages/SharedPostDetail").catch(() => ({ default: () => <div>Error loading page</div> })));
const Notifications = lazy(() => import("./pages/Notifications").catch(() => ({ default: () => <div>Error loading page</div> })));
const NotFound = lazy(() => import("./pages/NotFound").catch(() => ({ default: () => <div>Error loading page</div> })));

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
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }>
              <Routes>
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
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
