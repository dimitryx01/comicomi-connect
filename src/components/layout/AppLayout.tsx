
import { ReactNode } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "./Navbar";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {!isAuthenticated && <Navbar isAuthenticated={false} />}
          <div className={`container py-6 ${!isAuthenticated ? 'pt-4' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
