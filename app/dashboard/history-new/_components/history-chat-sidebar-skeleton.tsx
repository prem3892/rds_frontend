import { Skeleton } from "@/components/ui/skeleton";

export const HistoryChatSidebarSkeleton = () => (
  <div className="space-y-3 p-2">
    {Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="space-y-3">
        <div className="flex items-start space-x-3">
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
    ))}
  </div>
);
