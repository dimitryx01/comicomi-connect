
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { LazyImage } from '@/components/ui/LazyImage';

interface PostContentProps {
  content: string;
  imageUrl?: string;
  videoUrl?: string;
}

export const PostContent = ({ content, imageUrl, videoUrl }: PostContentProps) => {
  return (
    <>
      {/* Post Content */}
      <div className="px-3 sm:px-4 pb-3">
        <p className="text-sm whitespace-pre-line break-words">{content}</p>
      </div>

      {/* Post Media con Lazy Loading */}
      {imageUrl && (
        <div className="relative w-full">
          <AspectRatio ratio={4/3} className="bg-muted">
            <LazyImage
              src={imageUrl}
              alt="Post"
              className="object-cover w-full h-full rounded-none"
            />
          </AspectRatio>
        </div>
      )}
      
      {videoUrl && (
        <div className="relative w-full">
          <AspectRatio ratio={16/9} className="bg-muted">
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-full object-cover rounded-none"
              preload="metadata"
            />
          </AspectRatio>
        </div>
      )}
    </>
  );
};
