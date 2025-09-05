import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="mx-auto space-y-6 flex bg-[#f2f4f8] rounded-3xl h-full">
      {/* Chat Sidebar Skeleton */}
      <aside className="w-full sm:w-80 xl:w-96 flex rounded-l-3xl flex-col p-2 sm:p-4 h-full">
        <div className="bg-white rounded-3xl p-3 sm:p-5 h-full shadow-sm">
          {/* Sidebar Header */}
          <div className="p-2 sm:p-4">
            <div className="flex items-center gap-2">
              <Skeleton className="size-10 bg-blue-500 rounded-md" />
              <Skeleton className="h-6 w-32 bg-gray-200 rounded" />
            </div>
          </div>

          {/* Pending Requests Section */}
          <div className="p-1 sm:p-2 border-b border-gray-100">
            <Skeleton className="h-4 w-40 bg-gray-200 rounded mb-2" />
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-24 bg-gray-200 rounded" />
                      <Skeleton className="h-3 w-32 bg-gray-200 rounded" />
                    </div>
                    <Skeleton className="h-8 w-16 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Chats List */}
          <div className="flex-1 p-1 sm:p-2">
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="p-3 hover:bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 bg-gray-200 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <Skeleton className="h-4 w-28 bg-gray-200 rounded" />
                        <Skeleton className="h-3 w-12 bg-gray-200 rounded" />
                      </div>
                      <Skeleton className="h-3 w-40 bg-gray-200 rounded" />
                    </div>
                    <Skeleton className="h-2 w-2 bg-gray-200 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Chat View Area Skeleton */}
      <main className="flex-1 bg-[#f2f4f8] p-4">
        <div className="bg-white rounded-3xl h-full flex flex-col shadow-sm overflow-hidden">
          {/* Chat Header Skeleton */}
          <header className="bg-white rounded-t-3xl p-4">
            <div className="flex items-center justify-between">
              {/* Left side - Back button and guest info */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 bg-gray-200 rounded" />
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-9 w-9 bg-gray-200 rounded-full" />
                  <div className="min-w-0">
                    <Skeleton className="h-5 w-32 bg-gray-200 rounded mb-1" />
                    <Skeleton className="h-4 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              </div>

              {/* Right side - Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Skeleton className="h-8 w-20 bg-gray-200 rounded" />
                <Skeleton className="h-8 w-16 bg-gray-200 rounded" />
                <Skeleton className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            </div>

            {/* Care message skeleton */}
            <div className="mt-3 p-3 bg-gradient-to-r from-blue-100 to-transparent rounded-none">
              <Skeleton className="h-4 w-48 bg-blue-200 rounded" />
            </div>
          </header>

          {/* Status Banner Skeleton */}
          <div className="px-4 py-2 bg-blue-50 border-b">
            <Skeleton className="h-4 w-40 bg-blue-200 rounded" />
          </div>

          {/* Chat Messages Area Skeleton */}
          <div className="flex-1 p-4 space-y-4 overflow-auto">
            {/* Message bubbles */}
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className={`flex ${index % 3 === 0 ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md ${index % 3 === 0 ? 'bg-blue-500' : 'bg-gray-100'} rounded-lg p-3`}>
                  <Skeleton 
                    className={`h-4 w-32 rounded ${index % 3 === 0 ? 'bg-blue-300' : 'bg-gray-200'}`} 
                  />
                  {index % 2 === 0 && (
                    <Skeleton 
                      className={`h-3 w-24 rounded mt-1 ${index % 3 === 0 ? 'bg-blue-300' : 'bg-gray-200'}`} 
                    />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Message Input Skeleton */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 flex-1 bg-gray-200 rounded-full" />
              <Skeleton className="h-10 w-10 bg-gray-200 rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
