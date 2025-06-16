
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RestaurantReviewFormProps {
  restaurantId: string;
  onSuccess?: () => void;
}

const RestaurantReviewForm = ({ restaurantId, onSuccess }: RestaurantReviewFormProps) => {
  const [ratings, setRatings] = useState({
    food_quality: 0,
    service: 0,
    cleanliness: 0,
    ambiance: 0,
    value: 0
  });
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const ratingCategories = [
    { key: 'food_quality', label: 'Calidad de la Comida', icon: '🍽️' },
    { key: 'service', label: 'Servicio', icon: '👥' },
    { key: 'cleanliness', label: 'Limpieza', icon: '🧽' },
    { key: 'ambiance', label: 'Ambiente', icon: '🌟' },
    { key: 'value', label: 'Relación Calidad-Precio', icon: '💰' }
  ];

  const handleRatingChange = (category: string, rating: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error",
        description: "Debes estar autenticado para dejar una reseña",
        variant: "destructive"
      });
      return;
    }

    // Validar que al menos haya algunas calificaciones
    const hasRatings = Object.values(ratings).some(rating => rating > 0);
    if (!hasRatings) {
      toast({
        title: "Error",
        description: "Debes calificar al menos una categoría",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase
        .from('restaurant_reviews')
        .insert({
          restaurant_id: restaurantId,
          user_id: user.id,
          food_quality_rating: ratings.food_quality || null,
          service_rating: ratings.service || null,
          cleanliness_rating: ratings.cleanliness || null,
          ambiance_rating: ratings.ambiance || null,
          value_rating: ratings.value || null,
          comment: comment.trim() || null,
          visit_date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;

      toast({
        title: "¡Éxito!",
        description: "Tu reseña ha sido publicada",
      });

      // Reset form
      setRatings({
        food_quality: 0,
        service: 0,
        cleanliness: 0,
        ambiance: 0,
        value: 0
      });
      setComment('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar la reseña",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const StarRating = ({ category, rating, onChange }: { category: string, rating: number, onChange: (rating: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={`h-6 w-6 transition-colors ${
              star <= rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 hover:text-yellow-400"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escribir Reseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Califica tu experiencia</Label>
            {ratingCategories.map((category) => (
              <div key={category.key} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className="font-medium">{category.label}</span>
                </div>
                <StarRating
                  category={category.key}
                  rating={ratings[category.key as keyof typeof ratings]}
                  onChange={(rating) => handleRatingChange(category.key, rating)}
                />
              </div>
            ))}
          </div>

          <div>
            <Label htmlFor="comment">Comentario (opcional)</Label>
            <Textarea
              id="comment"
              placeholder="Cuéntanos sobre tu experiencia..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Enviando...' : 'Publicar Reseña'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default RestaurantReviewForm;
