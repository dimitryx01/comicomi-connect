
import { ReactNode, memo, useMemo } from 'react';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  withoutPadding?: boolean;
}

const PageLayout = memo(({ 
  children, 
  className,
  withoutPadding = false
}: PageLayoutProps) => {
  const { isAuthenticated, loading } = useAuth();

  // Memoize computed values to prevent unnecessary re-renders
  const showNavbar = useMemo(() => isAuthenticated && !loading, [isAuthenticated, loading]);
  
  const mainClassName = useMemo(() => cn(
    "pt-16",
    !withoutPadding && "container mx-auto px-4 py-6 md:px-6 md:py-10",
    className
  ), [withoutPadding, className]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={showNavbar} />
      <main className={mainClassName}>
        {children}
      </main>
    </div>
  );
});

PageLayout.displayName = 'PageLayout';

export default PageLayout;
