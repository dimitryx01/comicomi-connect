
import { PersonalizedFeedView } from '@/components/feed/PersonalizedFeedView';

const Feed = () => {
  console.log('📱 Feed: Rendering personalized feed page');
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <PersonalizedFeedView />
      </div>
    </div>
  );
};

export default Feed;
