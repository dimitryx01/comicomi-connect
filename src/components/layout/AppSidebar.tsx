
import { Home, Users, Compass, ChefHat, Store, MessageCircle, Settings, ShoppingCart, Bookmark, Bell } from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const menuItems = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Siguiendo",
    url: "/following",
    icon: Users,
  },
  {
    title: "Descubrir",
    url: "/discover",
    icon: Compass,
  },
  {
    title: "Recetas",
    url: "/recipes",
    icon: ChefHat,
  },
  {
    title: "Restaurantes",
    url: "/restaurants",
    icon: Store,
  },
  {
    title: "Mensajes",
    url: "/messages",
    icon: MessageCircle,
  },
  {
    title: "Notificaciones",
    url: "/notifications",
    icon: Bell,
  },
  {
    title: "Lista de Compras",
    url: "/shopping",
    icon: ShoppingCart,
  },
  {
    title: "Guardados",
    url: "/saved",
    icon: Bookmark,
  },
  {
    title: "Configuración",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              size="lg" 
              onClick={() => navigate("/profile")}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={undefined} alt={user?.email || ""} />
                <AvatarFallback>
                  {user?.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left">
                <span className="text-sm font-medium truncate">
                  {user?.email || "Usuario"}
                </span>
                <span className="text-xs text-muted-foreground">
                  @{user?.email || "usuario"}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <a href={item.url} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                      {item.title === "Notificaciones" && unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center text-xs p-0">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  );
}
