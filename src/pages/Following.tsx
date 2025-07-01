
import { FollowingSidebar } from '@/components/sidebar/FollowingSidebar';
import { useIsMobile } from '@/hooks/use-mobile';

const Following = () => {
  const isMobile = useIsMobile();
  console.log('👥 Following: Rendering following page');
  
  return (
    <div className={`${isMobile ? 'mobile-full-width pb-20' : ''}`}>
      <FollowingSidebar />
    </div>
  );
};

export default Following;
