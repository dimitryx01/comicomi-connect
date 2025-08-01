import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('[DEBUG] AuthGuard: Auth state', { isAuthenticated, loading, hasUser: !!user, pathname: location.pathname });

  useEffect(() => {
    // Only handle redirections when not loading
    if (loading) return;

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const isPublicPage = location.pathname === '/' || location.pathname === '/discover';

    console.log('[DEBUG] AuthGuard: Redirect logic', { isAuthPage, isPublicPage, isAuthenticated });

    // If authenticated and on auth pages, redirect to feed
    if (isAuthenticated && isAuthPage) {
      console.log('[DEBUG] AuthGuard: Redirecting authenticated user from auth page to feed');
      navigate('/feed', { replace: true });
      return;
    }

    // If not authenticated and on protected pages, redirect to login
    if (!isAuthenticated && !isPublicPage && !isAuthPage) {
      console.log('[DEBUG] AuthGuard: Redirecting unauthenticated user to login');
      navigate('/login', { replace: true });
      return;
    }
  }, [isAuthenticated, loading, location.pathname, navigate]);

  return <>{children}</>;
};