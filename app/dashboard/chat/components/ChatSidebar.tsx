import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, MessageCircle } from "lucide-react";
import { ChatSession } from "@/types";
import ChatListItem from "./ChatListItem";
import PendingChatRequestCard from "./PendingChatRequestCard";

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
  <aside className="w-80 xl:w-96 flex rounded-l-3xl flex-col bg-[#f2f4f8] p-5">
    <div className="bg-white rounded-3xl p-5 h-full shadow-sm">
      <div className="p-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-blue-600" />
          Recent Chats
        </h2>
      </div>

      {/* Pending Requests */}
      {pendingSessions.length > 0 && (
        <div className="p-2 border-b border-gray-100">
          <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
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
      <ScrollArea className="flex-1 p-2">
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
