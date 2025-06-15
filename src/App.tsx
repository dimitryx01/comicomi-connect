
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import Index from "./pages/Index";
import Feed from "./pages/Feed";
import Discover from "./pages/Discover";
import Recipes from "./pages/Recipes";
import Restaurants from "./pages/Restaurants";
import Following from "./pages/Following";
import Saved from "./pages/Saved";
import Shopping from "./pages/Shopping";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import RestaurantDetail from "./pages/RestaurantDetail";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppLayout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/discover" element={<Discover />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/restaurants" element={<Restaurants />} />
              <Route path="/following" element={<Following />} />
              <Route path="/saved" element={<Saved />} />
              <Route path="/shopping" element={<Shopping />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/restaurant/:id" element={<RestaurantDetail />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
