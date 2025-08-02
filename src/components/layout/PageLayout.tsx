
import { ReactNode, memo, useMemo } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
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

  const isAuthenticatedAndReady = isAuthenticated && !loading;

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
      <Footer />
    </div>
  );
};

export default PageLayoutComponent;
