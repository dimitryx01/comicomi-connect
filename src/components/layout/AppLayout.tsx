
import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();

  // Always show sidebar layout, but with different content based on auth status
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Show navbar for non-authenticated users */}
          {!isAuthenticated && <Navbar isAuthenticated={false} />}
          <div className={`container py-6 ${!isAuthenticated ? 'pt-20' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
