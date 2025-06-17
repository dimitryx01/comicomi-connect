
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const PostSkeleton = () => {
  return (
    <Card className="border-none shadow-sm overflow-hidden mb-4 w-full">
      <CardContent className="p-0">
        {/* Header skeleton */}
        <div className="flex items-center justify-between p-3 sm:p-4">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Skeleton className="h-8 w-8 sm:h-10 sm:w-10 rounded-full flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-4 w-24 mb-1" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>

        {/* Content skeleton */}
        <div className="px-3 sm:px-4 pb-3">
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Media skeleton */}
        <Skeleton className="w-full h-64" />
      </CardContent>

      <CardFooter className="p-0">
        {/* Actions skeleton */}
        <div className="w-full p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};
