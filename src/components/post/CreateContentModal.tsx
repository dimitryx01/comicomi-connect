
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ChefHat, ShoppingCart, MapPin } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CreatePostForm from '@/components/post/CreatePostForm';

import CreateRestaurantForm from '@/components/restaurant/CreateRestaurantForm';

interface CreateContentModalProps {
  children: React.ReactNode;
}

export const CreateContentModal = ({ children }: CreateContentModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOptionSelect = (optionId: string) => {
    if (optionId === 'shopping') {
      setIsOpen(false);
      navigate('/shopping?create=list');
    } else if (optionId === 'recipe') {
      setIsOpen(false);
      navigate('/recipes?create=true');
    } else {
      setSelectedOption(optionId);
    }
  };

  const handleFormSuccess = () => {
    setSelectedOption(null);
    setIsOpen(false);
  };

  const contentOptions = [
    {
      id: 'post',
      title: 'Publicación',
      description: 'Comparte tu experiencia culinaria',
      icon: FileText,
    },
    {
      id: 'recipe',
      title: 'Receta',
      description: 'Comparte tu receta favorita',
      icon: ChefHat,
    },
    {
      id: 'shopping',
      title: 'Shopping List',
      description: 'Crea una lista de compras',
      icon: ShoppingCart,
    },
    {
      id: 'restaurant',
      title: 'Agregar un sitio',
      description: 'Sugiere un nuevo restaurante',
      icon: MapPin,
    }
  ];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          {children}
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-xl">
          <SheetHeader className="text-center mb-6">
            <SheetTitle className="text-xl">¿Qué quieres crear?</SheetTitle>
          </SheetHeader>
          
          <div className="grid grid-cols-2 gap-3 px-4">
            {contentOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                onClick={() => handleOptionSelect(option.id)}
                className={cn(
                  "h-24 flex flex-col items-center justify-center gap-2 p-4",
                  "hover:bg-primary/5 transition-colors"
                )}
              >
                <option.icon className="h-6 w-6 text-primary" />
                <div className="text-center">
                  <div className="font-medium text-sm">{option.title}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Dialog for Post Creation */}
      <Dialog open={selectedOption === 'post'} onOpenChange={(open) => !open && setSelectedOption(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Crear nueva publicación</DialogTitle>
          </DialogHeader>
          <CreatePostForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>


      {/* Dialog for Restaurant Creation */}
      <Dialog open={selectedOption === 'restaurant'} onOpenChange={(open) => !open && setSelectedOption(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <CreateRestaurantForm onSuccess={handleFormSuccess} />
        </DialogContent>
      </Dialog>
    </>
  );
};
