
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { AppLayout } from "./components/layout/AppLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Feed from "./pages/Feed";
import Following from "./pages/Following";
import Discover from "./pages/Discover";
import Recipes from "./pages/Recipes";
import Restaurants from "./pages/Restaurants";
import RestaurantDetail from "./pages/RestaurantDetail";
import Shopping from "./pages/Shopping";
import Saved from "./pages/Saved";
import Settings from "./pages/Settings";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import { CacheMetricsDisplay } from "./components/debug/CacheMetricsDisplay";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10,   // 10 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* Ruta para perfiles públicos - debe estar antes de las rutas protegidas */}
            <Route path="/@:username" element={<PublicProfile />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Index />} />
              <Route path="profile" element={<Profile />} />
              <Route path="feed" element={<Feed />} />
              <Route path="following" element={<Following />} />
              <Route path="discover" element={<Discover />} />
              <Route path="recipes" element={<Recipes />} />
              <Route path="restaurants" element={<Restaurants />} />
              <Route path="restaurants/:id" element={<RestaurantDetail />} />
              <Route path="shopping" element={<Shopping />} />
              <Route path="saved" element={<Saved />} />
              <Route path="settings" element={<Settings />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
          
          {/* Componentes de debug/monitoreo - Solo en desarrollo */}
          <CacheMetricsDisplay />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
