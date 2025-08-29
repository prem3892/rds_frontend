import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle } from "lucide-react";
import { ChatSession } from "@/types";
import ChatListItem from "./ChatListItem";
import PendingChatRequestCard from "./PendingChatRequestCard";
import { ChatIcon } from "@/components/icons";

interface ChatSidebarProps {
  activeSessions: ChatSession[];
  pendingSessions: ChatSession[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onAcceptChat: (sessionId: string) => void;
  isLoading: boolean;
}

const ChatSidebar = ({
  activeSessions,
  pendingSessions,
  selectedSessionId,
  onSelectSession,
  onAcceptChat,
  isLoading,
}: ChatSidebarProps) => (
  <aside className="w-full sm:w-80 xl:w-96 flex rounded-l-3xl flex-col bg-[#f2f4f8] p-2 sm:p-5">
    <div className="bg-white rounded-3xl p-3 sm:p-5 h-full shadow-sm">
      <div className="p-2 sm:p-4">
        <div className="flex items-center gap-2">
          <div className="size-10 bg-blue-500 rounded-md flex items-center justify-center">

          <ChatIcon className="size-7 text-white" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold">
          Recent Chats
        </h2>
        </div>
      </div>

      {/* Pending Requests */}
      {pendingSessions.length > 0 && (
        <div className="p-1 sm:p-2 border-b border-gray-100">
          <h3 className="px-1 sm:px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            Pending Requests ({pendingSessions.length})
          </h3>
          <ScrollArea className="h-auto max-h-60">
            {pendingSessions.map((session) => (
              <PendingChatRequestCard
                key={session._id}
                session={session}
                onAccept={onAcceptChat}
              />
            ))}
          </ScrollArea>
        </div>
      )}

      {/* Active Chats List */}
      <ScrollArea className="flex-1 p-1 sm:p-2">
        {isLoading && activeSessions.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading active
            chats...
          </div>
        )}
        {!isLoading &&
          activeSessions.length === 0 &&
          pendingSessions.length === 0 && (
            <p className="p-4 text-center text-sm text-muted-foreground">
              No active or pending chats.
            </p>
          )}
        {activeSessions.map((session) => (
          <ChatListItem
            key={session._id}
            session={session}
            isSelected={selectedSessionId === session._id}
            onSelect={() => onSelectSession(session._id)}
          />
        ))}
      </ScrollArea>
    </div>
  </aside>
);

export default ChatSidebar;
