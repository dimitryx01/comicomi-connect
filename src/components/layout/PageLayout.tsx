
import { ReactNode } from 'react';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  className?: string;
  withoutPadding?: boolean;
}

const PageLayout = ({ 
  children, 
  isAuthenticated = false, 
  className,
  withoutPadding = false
}: PageLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={isAuthenticated} />
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

export default PageLayout;
