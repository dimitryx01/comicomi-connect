
import { useState } from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useComments } from '@/hooks/useComments';
import { useCheers } from '@/hooks/useCheers';
import { useAuth } from '@/contexts/AuthContext';
import { PostHeader } from './PostHeader';
import { PostContent } from './PostContent';
import { PostActions } from './PostActions';
import { PostComments } from './PostComments';

export interface PostProps {
  id: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  content: string;
  imageUrl?: string;
  videoUrl?: string;
  likes: number;
  comments: number;
  createdAt: string;
  restaurant?: {
    id: string;
    name: string;
  };
  isLiked?: boolean;
}

const PostCard = ({
  id,
  user,
  content,
  imageUrl,
  videoUrl,
  createdAt,
  restaurant,
}: PostProps) => {
  const [showComments, setShowComments] = useState(false);
  
  const { user: currentUser } = useAuth();
  const { comments, commentsCount, loading: commentsLoading, addComment } = useComments(id);
  const { cheersCount, hasCheered, loading: cheersLoading, toggleCheer } = useCheers(id);

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <Card className="border-none shadow-sm overflow-hidden animate-scale-in mb-4 w-full">
      <CardContent className="p-0">
        <PostHeader user={user} restaurant={restaurant} />
        <PostContent content={content} imageUrl={imageUrl} videoUrl={videoUrl} />
      </CardContent>

      <CardFooter className="p-0">
        <PostActions
          cheersCount={cheersCount}
          hasCheered={hasCheered}
          cheersLoading={cheersLoading}
          commentsCount={commentsCount}
          showComments={showComments}
          createdAt={createdAt}
          currentUser={currentUser}
          onToggleCheer={toggleCheer}
          onToggleComments={handleToggleComments}
        />
      </CardFooter>

      {/* Comments Section */}
      {showComments && (
        <PostComments
          comments={comments}
          currentUser={currentUser}
          commentsLoading={commentsLoading}
          onAddComment={addComment}
        />
      )}
    </Card>
  );
};

export default PostCard;
