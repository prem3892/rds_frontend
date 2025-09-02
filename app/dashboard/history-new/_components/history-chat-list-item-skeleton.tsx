import { Skeleton } from "@/components/ui/skeleton";

export const HistoryChatListItemSkeleton = () => (
  <div className="w-full p-2 sm:p-3 h-auto mb-1 flex items-start text-left rounded-lg bg-gray-50">
    <div className="flex-1 overflow-hidden min-w-0">
      <div className="flex justify-between items-start mb-1 sm:mb-2">
        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-6" />
          <div className="flex items-center gap-1 flex-shrink-0">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-3" />
          </div>
        </div>
        <div className="flex-shrink-0 ml-2">
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      
      <div className="mb-2">
        <Skeleton className="h-3 w-48" />
      </div>

      <div className="flex flex-col gap-1">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  </div>
);
