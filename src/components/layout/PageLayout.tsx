
import { ReactNode, memo, useMemo } from 'react';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  withoutPadding?: boolean;
}

const PageLayoutComponent = ({ 
  children, 
  className,
  withoutPadding = false
}: PageLayoutProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Memoizar el estado de autenticación para evitar re-renders
  const isAuthenticatedAndReady = useMemo(() => 
    isAuthenticated && !loading, 
    [isAuthenticated, loading]
  );

  // Solo loggear en desarrollo para reducir ruido
  if (process.env.NODE_ENV === 'development') {
    console.log('PageLayout - isAuthenticated:', isAuthenticated, 'loading:', loading);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticatedAndReady} />
      <main className={cn(
        "pt-16",
        !withoutPadding && "container mx-auto px-4 py-6 md:px-6 md:py-10",
        className
      )}>
        {children}
      </main>
    </div>
  );
};

// Memoizar el componente para evitar re-renders innecesarios
const PageLayout = memo(PageLayoutComponent);
export default PageLayout;
