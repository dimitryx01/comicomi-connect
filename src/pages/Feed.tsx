
import { UnifiedFeedView } from '@/components/feed/UnifiedFeedView';

const Feed = () => {
  console.log('📱 Feed: Rendering main feed page');
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Feed</h1>
          <p className="text-muted-foreground">Descubre las últimas publicaciones y contenido compartido</p>
        </div>
        
        <UnifiedFeedView />
      </div>
    </div>
  );
};

export default Feed;
