
import { useState, useEffect, memo, useMemo, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Search, Plus, Bell, User, Menu, X, Users, Heart, ShoppingCart, MessageCircle, Settings, ChefHat } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { CreateContentModal } from '@/components/post/CreateContentModal';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar = memo(({
  isAuthenticated = false
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  // Memoize scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoize navigation links
  const navLinks = useMemo(() => [{
    path: "/feed",
    icon: <Home className="w-6 h-6" />,
    label: "Feed"
  }, {
    path: "/discover",
    icon: <Search className="w-6 h-6" />,
    label: "Discover"
  }, {
    path: "create",
    icon: <Plus className="w-6 h-6" />,
    label: "Crear",
    isModal: true
  }, {
    path: "/notifications",
    icon: <Bell className="w-6 h-6" />,
    label: "Notifications"
  }, {
    path: "/profile",
    icon: <User className="w-6 h-6" />,
    label: "Profile"
  }], []);

  // Memoize sidebar links
  const sidebarLinks = useMemo(() => [
    { title: "Feed", url: "/feed", icon: Home },
    { title: "Discover", url: "/discover", icon: Search },
    { title: "Recipes", url: "/recipes", icon: ChefHat },
    { title: "Restaurants", url: "/restaurants", icon: Search },
    { title: "Following", url: "/following", icon: Users },
    { title: "Saved", url: "/saved", icon: Heart },
    { title: "Shopping Lists", url: "/shopping", icon: ShoppingCart },
    { title: "Messages", url: "/messages", icon: MessageCircle },
    { title: "Notifications", url: "/notifications", icon: Bell },
    { title: "Profile", url: "/profile", icon: User },
    { title: "Settings", url: "/settings", icon: Settings },
  ], []);

  // Memoize drawer close callback
  const handleDrawerClose = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  // Memoize avatar fallback text
  const avatarFallbackText = useMemo(() => {
    return profile?.full_name || user?.email || 'Usuario';
  }, [profile?.full_name, user?.email]);

  // Mobile Bottom Navigation
  if (isMobile && isAuthenticated) {
    return (
      <>
        {/* Top header with logo and hamburger */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b h-14 flex items-center justify-between px-4">
          <Link to="/feed" className="flex items-center">
            <h1 className="text-xl font-bold text-primary">
              comicomi
            </h1>
          </Link>

          <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="h-[80vh]">
              <div className="p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-primary">comicomi</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDrawerClose}
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                
                <nav className="space-y-2 flex-1 overflow-y-auto">
                  {sidebarLinks.map((link) => (
                    <Link
                      key={link.url}
                      to={link.url}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg transition-colors",
                        location.pathname === link.url
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted"
                      )}
                      onClick={handleDrawerClose}
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.title}</span>
                    </Link>
                  ))}
                </nav>
              </div>
            </DrawerContent>
          </Drawer>
        </header>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t h-16">
          <div className="grid grid-cols-5 h-full">
            {navLinks.map((link) => {
              if (link.path === "/notifications") {
                return (
                  <div key={link.path} className="flex items-center justify-center">
                    <NotificationBell />
                  </div>
                );
              }
              
              if (link.path === "/profile") {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="flex flex-col items-center justify-center p-2"
                  >
                    <AvatarWithSignedUrl 
                      fileId={profile?.avatar_url}
                      fallbackText={avatarFallbackText}
                      size="sm"
                    />
                  </Link>
                );
              }

              if (link.isModal) {
                return (
                  <CreateContentModal key={link.path}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex flex-col items-center justify-center p-2 text-muted-foreground hover:text-foreground w-full h-full rounded-none"
                    >
                      {link.icon}
                    </Button>
                  </CreateContentModal>
                );
              }

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex flex-col items-center justify-center p-2 transition-colors",
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.icon}
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  // Desktop Navigation
  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      isScrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
    )}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Always visible */}
          <Link to={isAuthenticated ? "/feed" : "/"} className="flex items-center">
            <h1 className="text-xl font-bold text-primary">
              comicomi
            </h1>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated ? (
            <>
              {!isMobile && (
                <nav className="hidden md:flex items-center space-x-1">
                  {navLinks.slice(0, -2).map(link => {
                    if (link.isModal) {
                      return (
                        <CreateContentModal key={link.path}>
                          <Button
                            variant="ghost"
                            className="flex flex-col items-center p-2 rounded-md transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
                          >
                            {link.icon}
                            <span className="text-xs mt-1">{link.label}</span>
                          </Button>
                        </CreateContentModal>
                      );
                    }
                    
                    return (
                      <Link
                        key={link.path}
                        to={link.path}
                        className={cn(
                          "flex flex-col items-center p-2 rounded-md transition-colors",
                          location.pathname === link.path
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {link.icon}
                        <span className="text-xs mt-1">{link.label}</span>
                      </Link>
                    );
                  })}
                  
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  <Link to="/profile" className="ml-2">
                    <AvatarWithSignedUrl 
                      fileId={profile?.avatar_url}
                      fallbackText={avatarFallbackText}
                      size="md"
                    />
                  </Link>
                </nav>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">
                  Sign up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
