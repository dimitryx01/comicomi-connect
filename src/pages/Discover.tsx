
import { UnifiedFeedView } from '@/components/feed/UnifiedFeedView';

const Discover = () => {
  console.log('🔍 Discover: Rendering discover page');
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Descubrir</h1>
          <p className="text-muted-foreground">Explora publicaciones, recetas y restaurantes de la comunidad</p>
        </div>
        
        <UnifiedFeedView />
      </div>
    </div>
  );
};

export default Discover;
