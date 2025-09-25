"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useGetCannedMessagesInfinite } from "@/lib/canned.api";
import { cn } from "@/lib/utils";
import { MessageSquare, Tag, Loader2 } from "lucide-react";
import { useEffect, useRef, useState, useCallback } from "react";

interface CannedMessageSelectorProps {
  isVisible: boolean;
  searchQuery: string;
  onSelectMessage: (content: string) => void;
  onClose: () => void;
}

const CannedMessageSelector = ({
  isVisible,
  searchQuery,
  onSelectMessage,
  onClose,
}: CannedMessageSelectorProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const previousScrollHeight = useRef<number>(0);
  const previousScrollTop = useRef<number>(0);
  const isScrollingToLoad = useRef<boolean>(false);

  // Debounced search query for API calls
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search query
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery.replace(/^#/, ""));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch canned messages with infinite scrolling
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    isError,
  } = useGetCannedMessagesInfinite({
    search: debouncedSearchQuery,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Flatten all pages into a single array and remove duplicates
  const messages = data?.pages.flatMap((page: any) => page.items) || [];
  const uniqueMessages = messages.filter((message, index, self) => 
    index === self.findIndex(m => m._id === message._id)
  );

  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Prevent scroll jumping by maintaining position during data updates
  useEffect(() => {
    if (!isFetchingNextPage && isScrollingToLoad.current && scrollContainerRef.current) {
      // After new data loads, maintain scroll position
      const container = scrollContainerRef.current;
      
      // Use multiple attempts to restore scroll position
      const restoreScrollPosition = () => {
        if (container && previousScrollHeight.current > 0) {
          const newScrollHeight = container.scrollHeight;
          const heightDifference = newScrollHeight - previousScrollHeight.current;
          
          if (heightDifference > 0) {
            // Maintain the scroll position by adjusting for the new content
            const targetScrollTop = previousScrollTop.current + heightDifference;
            container.scrollTop = targetScrollTop;
            
            // Verify the scroll position was set correctly
            if (Math.abs(container.scrollTop - targetScrollTop) > 5) {
              // If not set correctly, try again
              setTimeout(() => {
                container.scrollTop = targetScrollTop;
              }, 10);
            }
          }
        }
        
        // Reset all tracking variables
        previousScrollHeight.current = 0;
        previousScrollTop.current = 0;
        isScrollingToLoad.current = false;
      };
      
      // Try multiple times to ensure scroll position is restored
      setTimeout(restoreScrollPosition, 10);
      setTimeout(restoreScrollPosition, 50);
      setTimeout(restoreScrollPosition, 100);
    }
  }, [isFetchingNextPage, uniqueMessages.length]);

  // Store scroll position when starting to fetch next page
  useEffect(() => {
    if (isFetchingNextPage && isScrollingToLoad.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      previousScrollHeight.current = container.scrollHeight;
      previousScrollTop.current = container.scrollTop;
    }
  }, [isFetchingNextPage]);

  // Intersection Observer for infinite scrolling
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        // Store scroll position before triggering fetch
        if (scrollContainerRef.current) {
          const container = scrollContainerRef.current;
          previousScrollHeight.current = container.scrollHeight;
          previousScrollTop.current = container.scrollTop;
          isScrollingToLoad.current = true;
        }
        fetchNextPage();
      }
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  useEffect(() => {
    if (!isVisible || !hasNextPage) return;

    let observer: IntersectionObserver | null = null;

    // Use a small delay to ensure the element is rendered
    const timer = setTimeout(() => {
      const element = loadMoreRef.current;
      if (!element) return;

      observer = new IntersectionObserver(handleObserver, {
        threshold: 0.1,
        rootMargin: '20px'
      });

      observer.observe(element);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [handleObserver, isVisible, hasNextPage, uniqueMessages.length]);

  // Fallback scroll event listener
  useEffect(() => {
    if (!isVisible || !hasNextPage || isFetchingNextPage) return;

    const handleScroll = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold

      if (isNearBottom && hasNextPage && !isFetchingNextPage) {
        // Store scroll position before triggering fetch
        const container = scrollContainerRef.current;
        if (container) {
          previousScrollHeight.current = container.scrollHeight;
          previousScrollTop.current = container.scrollTop;
          isScrollingToLoad.current = true;
        }
        fetchNextPage();
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll to selected item when it changes
  useEffect(() => {
    if (isVisible && uniqueMessages.length > 0) {
      setTimeout(() => {
        const selectedElement = scrollContainerRef.current?.querySelector(`[data-message-index="${selectedIndex}"]`);
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest'
          });
        }
      }, 100);
    }
  }, [selectedIndex, isVisible, uniqueMessages.length]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev < uniqueMessages.length - 1 ? prev + 1 : 0;
            // Scroll to the selected item
            setTimeout(() => {
              const selectedElement = scrollContainerRef.current?.querySelector(`[data-message-index="${newIndex}"]`);
              if (selectedElement) {
                selectedElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest'
                });
              }
            }, 0);
            return newIndex;
          });
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => {
            const newIndex = prev > 0 ? prev - 1 : uniqueMessages.length - 1;
            // Scroll to the selected item
            setTimeout(() => {
              const selectedElement = scrollContainerRef.current?.querySelector(`[data-message-index="${newIndex}"]`);
              if (selectedElement) {
                selectedElement.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest'
                });
              }
            }, 0);
            return newIndex;
          });
          break;
        case "Enter":
          e.preventDefault();
          if (uniqueMessages[selectedIndex]) {
            onSelectMessage(uniqueMessages[selectedIndex].content);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isVisible, uniqueMessages, selectedIndex, onSelectMessage, onClose]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 z-50">
      <Card 
        ref={containerRef}
        className="w-[70%] mx-auto shadow-lg border border-gray-200 bg-white p-0 "
      >
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                Canned Messages
              </span>
              {searchQuery && (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  Search: {searchQuery.replace(/^#/, "")}
                  {isSearching && (
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                  )}
                </span>
              )}
            </div>
            <Badge variant="secondary" className="text-xs">
              {uniqueMessages.length} messages{hasNextPage ? "+" : ""}
            </Badge>
          </div>

          {/* Messages List */}
          <div ref={scrollContainerRef} className="max-h-64 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Loading messages...
              </div>
            ) : isError ? (
              <div className="p-4 text-center text-red-500">
                Failed to load messages. Please try again.
              </div>
            ) : uniqueMessages.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchQuery ? "No messages found" : "No canned messages available"}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {uniqueMessages.map((message, index) => (
                  <div
                    key={message._id}
                    data-message-index={index}
                    className={cn(
                      "p-3 cursor-pointer transition-colors hover:bg-blue-50",
                      selectedIndex === index && "bg-blue-100 border-l-4 border-blue-500"
                    )}
                    onClick={() => onSelectMessage(message.content)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {message.title}
                          </h4>
                          {message.isGlobal && (
                            <Badge variant="outline" className="text-xs">
                              Global
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {message.content}
                        </p>
                        {message.tags.length > 0 && (
                          <div className="flex items-center gap-1 mt-2">
                            <Tag className="h-3 w-3 text-gray-400" />
                            <div className="flex gap-1">
                              {message.tags.slice(0, 3).map((tag: string) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {message.tags.length > 3 && (
                                <span className="text-xs text-gray-500">
                                  +{message.tags.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Load More Trigger */}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="p-3 text-center border-t border-gray-100">
                    {isFetchingNextPage ? (
                      <div className="flex items-center justify-center gap-2 text-blue-600 py-2 bg-blue-50 rounded-lg mx-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Loading more messages...</span>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 py-1">
                        Scroll down for more messages
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>↑↓ Navigate</span>
                <span>Enter Select</span>
                <span>Esc Close</span>
              </div>
              <span>Press # to search</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CannedMessageSelector;
