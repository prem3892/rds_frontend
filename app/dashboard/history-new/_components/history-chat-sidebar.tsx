import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { ChatSession } from "@/types";
import HistoryChatListItem from "./history-chat-list-item";
import { ChatIcon } from "@/components/icons";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { HistoryChatSidebarSkeleton } from "./history-chat-sidebar-skeleton";

interface HistoryChatSidebarProps {
  sessions: ChatSession[];
  selectedSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const HistoryChatSidebar = ({
  sessions,
  selectedSessionId,
  onSelectSession,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: HistoryChatSidebarProps) => (
  <aside className="w-full h-full flex rounded-3xl flex-col border bg-white shadow-sm overflow-hidden">
    <div className="p-2 sm:p-3 h-full flex flex-col">
      {/* Chat Sessions List */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ScrollArea className="h-full p-1">
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
        </ScrollArea>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-2 border-t border-gray-100 flex-shrink-0">
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  </aside>
);

export default HistoryChatSidebar;
