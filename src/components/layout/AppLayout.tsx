
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

  const handleTriggerClick = () => {
    console.log("Sidebar trigger clicked!");
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center p-2 border-b bg-background">
            <SidebarTrigger onClick={handleTriggerClick} />
          </div>
          
          {!isAuthenticated && <Navbar isAuthenticated={false} />}
          <div className={`container py-6 ${!isAuthenticated ? 'pt-4' : ''}`}>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
