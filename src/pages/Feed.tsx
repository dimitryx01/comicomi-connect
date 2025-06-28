
import { PersonalizedFeedView } from '@/components/feed/PersonalizedFeedView';
import { RandomRestaurantsSidebar } from '@/components/feed/RandomRestaurantsSidebar';
import { FollowingSidebar } from '@/components/sidebar/FollowingSidebar';

const Feed = () => {
  console.log('📱 Feed: Rendering personalized feed page');
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Columna principal del feed */}
        <div className="lg:col-span-2">
          <PersonalizedFeedView />
        </div>
        
        {/* Columna lateral con restaurantes y siguiendo */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            <FollowingSidebar />
            <RandomRestaurantsSidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;
