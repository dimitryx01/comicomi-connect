
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Search, PlusSquare, Bell, User, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { AvatarWithSignedUrl } from '@/components/ui/AvatarWithSignedUrl';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface NavbarProps {
  isAuthenticated?: boolean;
}

const Navbar = ({
  isAuthenticated = false
}: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { profile } = useUserProfile();

  console.log('Navbar - isAuthenticated:', isAuthenticated);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navLinks = [{
    path: "/feed",
    icon: <Home className="w-6 h-6" />,
    label: "Feed"
  }, {
    path: "/discover",
    icon: <Search className="w-6 h-6" />,
    label: "Discover"
  }, {
    path: "/restaurants",
    icon: <PlusSquare className="w-6 h-6" />,
    label: "Restaurants"
  }, {
    path: "/notifications",
    icon: <Bell className="w-6 h-6" />,
    label: "Notifications"
  }, {
    path: "/profile",
    icon: <User className="w-6 h-6" />,
    label: "Profile"
  }];

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
                  {navLinks.slice(0, -2).map(link => (
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
                  ))}
                  
                  {/* Notification Bell */}
                  <NotificationBell />
                  
                  <Link to="/profile" className="ml-2">
                    <AvatarWithSignedUrl 
                      fileId={profile?.avatar_url}
                      fallbackText={profile?.full_name || user?.email || 'Usuario'}
                      size="md"
                    />
                  </Link>
                </nav>
              )}

              {/* Mobile Hamburger Menu */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMenu}
                  className="md:hidden"
                >
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </Button>
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

      {/* Mobile Menu */}
      {isMobile && isMenuOpen && isAuthenticated && (
        <nav className="md:hidden bg-background border-t animate-slide-down">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-5 py-3">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "flex flex-col items-center p-2 rounded-md transition-colors",
                    location.pathname === link.path
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.icon}
                  <span className="text-xs mt-1">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};

export default Navbar;
