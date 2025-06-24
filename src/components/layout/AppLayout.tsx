
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export function AppLayout() {
  const { isAuthenticated } = useAuth();

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
