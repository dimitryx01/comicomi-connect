import { Button } from "@/components/ui/button";
import { CheersIcon } from '@/components/post/CheersIcon';
import { cn } from "@/lib/utils";

interface CommentCheersButtonProps {
  cheersCount: number;
  hasCheered: boolean;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export const CommentCheersButton = ({ 
  cheersCount, 
  hasCheered, 
  onClick, 
  loading = false, 
  disabled = false,
  className 
}: CommentCheersButtonProps) => {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        "p-0 h-auto text-xs gap-1 transition-all duration-200",
        hasCheered 
          ? "text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300" 
          : "text-muted-foreground hover:text-orange-500",
        loading && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
    >
      <CheersIcon 
        className={cn(
          "h-3 w-3 transform rotate-12 transition-all duration-200",
          hasCheered && "scale-110 text-orange-600 dark:text-orange-400"
        )} 
      />
      <span className="font-medium">{cheersCount}</span>
    </Button>
  );
};