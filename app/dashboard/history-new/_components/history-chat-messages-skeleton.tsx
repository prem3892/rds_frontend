import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

export const HistoryChatMessagesSkeleton = () => (
  <div className="h-full overflow-hidden">
    <ScrollArea className="h-full p-2 sm:p-4 space-y-1 bg-gray-50">
      <div className="space-y-4">
        {/* Date Separator Skeleton */}
        <div className="flex items-center justify-center my-3 sm:my-4">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        {/* Message Skeletons */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-64 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
        
        {/* Another Date Separator */}
        <div className="flex items-center justify-center my-3 sm:my-4">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        {/* More Message Skeletons */}
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={`second-${index}`} className="space-y-2">
            <div className="flex items-start gap-3 justify-end">
              <div className="flex-1 space-y-2 text-right">
                <Skeleton className="h-4 w-24 ml-auto" />
                <Skeleton className="h-16 w-48 rounded-lg ml-auto" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);
