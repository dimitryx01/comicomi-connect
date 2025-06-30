
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  
  // Rutas que deben mostrar la sidebar incluso sin autenticación
  const publicRoutesWithSidebar = ['/discover', '/restaurants', '/recipes'];
  const shouldShowSidebar = (isAuthenticated || publicRoutesWithSidebar.includes(location.pathname)) && !isMobile;

  // Mobile Layout - Full width, no sidebar
  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-background">
        <Navbar isAuthenticated={isAuthenticated} />
        <main className="flex-1 overflow-auto pt-14 pb-16">
          <div className="w-full">
            <Outlet />
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
          <div className="container py-6 pt-20">
            <Outlet />
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
          <div className="container py-6 pt-20">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
