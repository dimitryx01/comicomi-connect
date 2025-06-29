
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import { Outlet, useLocation } from "react-router-dom";

export function AppLayout() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  // Rutas que deben mostrar la sidebar incluso sin autenticación
  const publicRoutesWithSidebar = ['/discover', '/restaurants', '/recipes'];
  const shouldShowSidebar = isAuthenticated || publicRoutesWithSidebar.includes(location.pathname);

  if (!shouldShowSidebar) {
    // Layout sin sidebar para la landing page y otras rutas públicas
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

  // Layout con sidebar para usuarios autenticados y rutas específicas
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
