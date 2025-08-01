import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';

interface RequireOnboardingProps {
  children: React.ReactNode;
}

export const RequireOnboarding: React.FC<RequireOnboardingProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const navigate = useNavigate();

  const loading = authLoading || profileLoading;

  useEffect(() => {
    if (!loading && isAuthenticated && profile && !profile.onboarding_completed) {
      navigate('/onboarding', { replace: true });
    }
  }, [loading, isAuthenticated, profile, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (isAuthenticated && profile && !profile.onboarding_completed) {
    return null;
  }

  return <>{children}</>;
};