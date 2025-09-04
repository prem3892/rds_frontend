import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types";
import HistoryChatListItem from "./history-chat-list-item";
import { HistoryChatSidebarSkeleton } from "./history-chat-sidebar-skeleton";
import { Loader2 } from "lucide-react";
import { useEffect, useRef } from "react";

interface HistoryChatSidebarProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  isLoading: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

const HistoryChatSidebar = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  isLoading,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: HistoryChatSidebarProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-load more when scrolling near bottom
  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (!scrollArea || !hasNextPage || isFetchingNextPage) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollArea;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      
      if (isNearBottom && onLoadMore) {
        onLoadMore();
      }
    };

    scrollArea.addEventListener('scroll', handleScroll);
    return () => scrollArea.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <aside className="w-full h-full flex rounded-3xl flex-col border bg-white shadow-sm overflow-hidden">
      <div className="p-2 sm:p-3 h-full flex flex-col">
        {/* Chat Sessions List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full p-1">
            {isLoading && sessions.length === 0 && (
              <HistoryChatSidebarSkeleton />
            )}
            {!isLoading && sessions.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No chat history found.
              </p>
            )}
            {sessions.map((session) => (
              <HistoryChatListItem
                key={session._id}
                session={session}
                isSelected={selectedSessionId === session._id}
                onSelect={() => onSelectSession(session)}
              />
            ))}
            
            {/* Load More Button */}
            {hasNextPage && (
              <div className="p-2 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLoadMore}
                  disabled={isFetchingNextPage}
                  className="w-full"
                >
                  {isFetchingNextPage ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </Button>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </aside>
  );
};

export default HistoryChatSidebar;
