
import { Button } from "@/components/ui/button";
import { Bookmark } from 'lucide-react';

interface SaveButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  loading?: boolean;
  size?: 'sm' | 'lg' | 'default' | 'icon';
}

export const SaveButton = ({ isSaved, onToggle, loading = false, size = 'sm' }: SaveButtonProps) => {
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={onToggle}
      disabled={loading}
      className={`text-muted-foreground hover:text-foreground transition-colors flex items-center ${
        isSaved ? 'text-blue-500 hover:text-blue-600' : ''
      }`}
    >
      <Bookmark 
        className={`h-5 w-5 transition-all duration-200 ${
          isSaved ? 'fill-current text-blue-500' : ''
        }`} 
      />
    </Button>
  );
};
