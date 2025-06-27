
import { useState } from 'react';
import { Star, Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RestaurantReviewFormProps {
  restaurantId: string;
  restaurantName: string;
  onReviewSubmitted?: () => void;
  onCancel?: () => void;
}

interface RatingDimension {
  key: 'food_quality_rating' | 'service_rating' | 'ambiance_rating' | 'cleanliness_rating' | 'value_rating';
  label: string;
  icon: string;
  description: string;
}

const ratingDimensions: RatingDimension[] = [
  {
    key: 'food_quality_rating',
    label: 'Comida',
    icon: '🍽️',
    description: 'Calidad y sabor de los alimentos'
  },
  {
    key: 'service_rating',
    label: 'Servicio',
    icon: '🤝',
    description: 'Atención y profesionalidad del personal'
  },
  {
    key: 'ambiance_rating',
    label: 'Ambiente',
    icon: '🎶',
    description: 'Decoración, música y atmósfera general'
  },
  {
    key: 'cleanliness_rating',
    label: 'Limpieza',
    icon: '🧼',
    description: 'Higiene del local y servicios'
  },
  {
    key: 'value_rating',
    label: 'Precio/Calidad',
    icon: '💰',
    description: 'Relación entre precio y calidad'
  }
];

const RestaurantReviewForm = ({
  restaurantId,
  restaurantName,
  onReviewSubmitted,
  onCancel
}: RestaurantReviewFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [comment, setComment] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRatingChange = (dimension: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [dimension]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes iniciar sesión para dejar una reseña",
        variant: "destructive"
      });
      return;
    }

    // Validar que al menos 3 dimensiones tengan calificación
    const ratedDimensions = Object.values(ratings).filter(rating => rating > 0);
    if (ratedDimensions.length < 3) {
      toast({
        title: "Error",
        description: "Debes calificar al menos 3 aspectos del restaurante",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        restaurant_id: restaurantId,
        user_id: user.id,
        comment: comment.trim() || null,
        visit_date: visitDate || null,
        ...ratings
      };

      const { error } = await supabase
        .from('restaurant_reviews')
        .insert([reviewData]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: "Error",
            description: "Ya has dejado una reseña para este restaurante",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "¡Reseña enviada!",
        description: "Tu reseña ha sido publicada exitosamente",
      });

      // Reset form
      setRatings({});
      setComment('');
      setVisitDate('');
      
      onReviewSubmitted?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la reseña. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    current, 
    onChange, 
    dimension 
  }: { 
    current: number; 
    onChange: (rating: number) => void;
    dimension: string;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110 transform"
          >
            <Star
              className={`h-6 w-6 ${
                star <= current
                  ? 'text-yellow-500 fill-current'
                  : 'text-gray-300 hover:text-yellow-400'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            Reseña para {restaurantName}
          </CardTitle>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <p className="text-sm text-gray-600">
          Comparte tu experiencia para ayudar a otros usuarios
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating Dimensions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Califica tu experiencia</h3>
            <p className="text-sm text-gray-600 mb-4">
              Califica al menos 3 aspectos del restaurante (obligatorio)
            </p>
            
            {ratingDimensions.map((dimension) => (
              <div key={dimension.key} className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{dimension.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{dimension.label}</h4>
                        <p className="text-xs text-gray-500">{dimension.description}</p>
                      </div>
                      <StarRating
                        current={ratings[dimension.key] || 0}
                        onChange={(rating) => handleRatingChange(dimension.key, rating)}
                        dimension={dimension.key}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Visit Date */}
          <div className="space-y-2">
            <label htmlFor="visitDate" className="text-sm font-medium">
              Fecha de visita (opcional)
            </label>
            <input
              type="date"
              id="visitDate"
              value={visitDate}
              onChange={(e) => setVisitDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm font-medium">
              Comentario (opcional)
            </label>
            <Textarea
              id="comment"
              placeholder="Comparte más detalles sobre tu experiencia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={1000}
              className="resize-none"
            />
            <div className="text-xs text-gray-500 text-right">
              {comment.length}/1000 caracteres
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
                Cancelar
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isSubmitting || Object.values(ratings).filter(r => r > 0).length < 3}
              className="flex-1"
            >
              {isSubmitting ? 'Enviando...' : 'Publicar reseña'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RestaurantReviewForm;
