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

interface CreateContentModalProps {
  children: React.ReactNode;
}

export const CreateContentModal = ({ children }: CreateContentModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const contentOptions = [
    {
      id: 'post',
      title: 'Publicación',
      description: 'Comparte tu experiencia culinaria',
      icon: FileText,
      action: () => {
        setIsOpen(false);
        // Aquí iría la lógica para abrir el formulario de publicación
        navigate('/feed?create=post');
      }
    },
    {
      id: 'recipe',
      title: 'Receta',
      description: 'Comparte tu receta favorita',
      icon: ChefHat,
      action: () => {
        setIsOpen(false);
        navigate('/recipes?create=recipe');
      }
    },
    {
      id: 'shopping',
      title: 'Shopping List',
      description: 'Crea una lista de compras',
      icon: ShoppingCart,
      action: () => {
        setIsOpen(false);
        navigate('/shopping?create=list');
      }
    },
    {
      id: 'restaurant',
      title: 'Agregar un sitio',
      description: 'Sugiere un nuevo restaurante',
      icon: MapPin,
      action: () => {
        setIsOpen(false);
        navigate('/restaurants?create=restaurant');
      }
    }
  ];

  return (
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
              onClick={option.action}
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
  );
};