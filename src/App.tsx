import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import { CacheMetricsDisplay } from '@/components/debug/CacheMetricsDisplay';
import { ThemeProvider } from "next-themes";

const queryClient = new QueryClient();

function App() {
  return (
    <Router>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ThemeProvider defaultTheme="system" storageKey="comicomi-theme">
            <div className="min-h-screen bg-background">
              <Toaster />
              <Routes>
                {/* Rutas públicas sin AppLayout */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Rutas con AppLayout */}
                <Route path="/feed" element={<AppLayout><Feed /></AppLayout>} />
                <Route path="/discover" element={<AppLayout><Discover /></AppLayout>} />
                <Route path="/recipes" element={<AppLayout><Recipes /></AppLayout>} />
                <Route path="/restaurants" element={<AppLayout><Restaurants /></AppLayout>} />
                <Route path="/following" element={<AppLayout><Following /></AppLayout>} />
                <Route path="/saved" element={<AppLayout><Saved /></AppLayout>} />
                <Route path="/shopping" element={<AppLayout><Shopping /></AppLayout>} />
                <Route path="/settings" element={<AppLayout><Settings /></AppLayout>} />
                <Route path="/profile" element={<AppLayout><Profile /></AppLayout>} />
                <Route path="/restaurant/:id" element={<AppLayout><RestaurantDetail /></AppLayout>} />
                <Route path="/onboarding" element={<AppLayout><Onboarding /></AppLayout>} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Métricas de cache solo en desarrollo */}
              <CacheMetricsDisplay />
            </div>
          </ThemeProvider>
        </AuthProvider>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
