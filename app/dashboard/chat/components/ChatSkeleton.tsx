import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const ChatSkeleton = () => {
  // Create an array of skeleton messages with varying sizes and positions
  const skeletonMessages = [
    { isOwn: false, width: "60%", height: "h-16" },
    { isOwn: true, width: "45%", height: "h-12" },
    { isOwn: false, width: "70%", height: "h-20" },
    { isOwn: true, width: "55%", height: "h-14" },
    { isOwn: false, width: "50%", height: "h-10" },
    { isOwn: true, width: "65%", height: "h-16" },
    { isOwn: false, width: "40%", height: "h-8" },
  ];

  return (
    <div className="space-y-1">
      {/* Date separator skeleton */}
      <div className="flex items-center justify-center my-4">
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      
      {skeletonMessages.map((message, index) => (
        <div
          key={index}
          className={`flex my-1 ${message.isOwn ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`p-3 rounded-lg shadow-sm ${
              message.isOwn
                ? "bg-blue-600 rounded-br-none"
                : "bg-white border border-gray-200 rounded-bl-none"
            }`}
            style={{ width: message.width }}
          >
            {/* Message content skeleton */}
            <div className="space-y-2">
              {/* Main message text skeleton */}
              <Skeleton 
                className={`${message.height} w-full ${
                  message.isOwn ? "bg-blue-400" : "bg-gray-200"
                }`} 
              />
              
              {/* Time and status skeleton */}
              <div className="flex items-center justify-end gap-1 mt-1">
                <Skeleton 
                  className={`h-3 w-12 ${
                    message.isOwn ? "bg-blue-400" : "bg-gray-300"
                  }`} 
                />
                {message.isOwn && (
                  <div className="flex items-center gap-1">
                    <Skeleton className="h-3 w-3 bg-blue-400 rounded-full" />
                    <Skeleton className="h-3 w-8 bg-blue-400" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      
      {/* Additional skeleton messages for more realistic loading */}
      <div className="flex justify-start my-1">
        <div className="p-3 rounded-lg bg-white border border-gray-200 rounded-bl-none w-1/2">
          <div className="space-y-2">
            <Skeleton className="h-12 w-full bg-gray-200" />
            <div className="flex items-center justify-end gap-1 mt-1">
              <Skeleton className="h-3 w-12 bg-gray-300" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end my-1">
        <div className="p-3 rounded-lg bg-blue-600 rounded-br-none w-2/5">
          <div className="space-y-2">
            <Skeleton className="h-8 w-full bg-blue-400" />
            <div className="flex items-center justify-end gap-1 mt-1">
              <Skeleton className="h-3 w-12 bg-blue-400" />
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3 bg-blue-400 rounded-full" />
                <Skeleton className="h-3 w-8 bg-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSkeleton;
