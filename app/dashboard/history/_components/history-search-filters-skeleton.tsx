import { Skeleton } from "@/components/ui/skeleton";

export const HistorySearchFiltersSkeleton = () => (
  <div className="space-y-4">
    {/* Search Bar and Toggle Skeleton */}
    <div className="flex items-center space-x-2">
      <div className="relative flex-1 max-w-md">
        <Skeleton className="h-10 w-full rounded-md" />
      </div>
      <Skeleton className="h-10 w-20 rounded-md" />
      <Skeleton className="h-10 w-10 rounded-md" />
    </div>

    {/* Advanced Filters Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
    </div>
  </div>
);
