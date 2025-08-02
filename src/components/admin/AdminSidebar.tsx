import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { APP_CONFIG } from '@/config/app';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Home,
  MessageSquare,
  Building,
  HeadphonesIcon,
  Shield,
  Users,
  LogOut,
  ChevronDown,
} from 'lucide-react';

export function AdminSidebar() {
  const { adminUser, hasRole, logoutAdmin } = useAdminAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50";

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/control-admin/dashboard',
      icon: Home,
      show: true,
    },
    {
      title: 'Reportes',
      url: '/control-admin/reportes',
      icon: MessageSquare,
      show: hasRole('moderador_contenido'),
    },
    {
      title: 'Establecimientos',
      url: '/control-admin/establecimientos',
      icon: Building,
      show: hasRole('gestor_establecimientos'),
    },
    {
      title: 'Soporte Técnico',
      url: '/control-admin/soporte',
      icon: HeadphonesIcon,
      show: hasRole('soporte_tecnico'),
    },
    {
      title: 'Usuarios',
      url: '/control-admin/admin-users',
      icon: Users,
      show: hasRole('admin_master'),
    },
    {
      title: 'Auditoría',
      url: '/control-admin/auditoria',
      icon: Shield,
      show: hasRole('admin_master'),
    },
  ];

  const handleLogout = () => {
    logoutAdmin();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">Admin Panel</h2>
            <p className="text-xs text-muted-foreground">{APP_CONFIG.nameCapitalized}</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter(item => item.show).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) => getNavCls({ isActive })}
                    >
                      <item.icon className="mr-3 h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start space-x-3 h-auto p-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {adminUser ? getInitials(adminUser.full_name) : 'AD'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium truncate">
                  {adminUser?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {adminUser?.email}
                </p>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}