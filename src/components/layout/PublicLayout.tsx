
import { ReactNode } from 'react';
import Navbar from './Navbar';
import { cn } from '@/lib/utils';

interface PublicLayoutProps {
  children: ReactNode;
  className?: string;
}

const PublicLayout = ({ children, className }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar isAuthenticated={false} />
      <main className={cn(
        "pt-16 container mx-auto px-4 py-6 md:px-6 md:py-10",
        className
      )}>
        {children}
      </main>
    </div>
  );
};

export default PublicLayout;
