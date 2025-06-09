import React from "react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types";

interface ChatListItemProps {
  session: ChatSession & {
    unreadCount?: number;
    lastMessagePreview?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const ChatListItem = React.memo(
  ({ session, isSelected, onSelect }: ChatListItemProps) => (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      className="w-full justify-start p-3 h-auto mb-1 flex items-start text-left"
      onClick={onSelect}
    >
      <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
        <AvatarImage
          src={undefined /* No avatar URL available in the interface */}
        />
        <AvatarFallback className="text-sm">
          {typeof session.customerId === "object"
            ? session.customerId?.firstName?.charAt(0)?.toUpperCase() ||
              session.customerId?.email?.charAt(0)?.toUpperCase() ||
              "C"
            : "C"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm truncate block">
            {typeof session.customerId === "object"
              ? session.customerId?.firstName ||
                session.customerId?.email ||
                session.customerId._id.slice(-6)
              : session.customerId.slice(-6)}
          </span>
          {session.unreadCount && session.unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="ml-1 text-xs px-1.5 py-0.5 flex-shrink-0"
            >
              {session.unreadCount}
            </Badge>
          ) : null}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {session.lastMessagePreview || session.status.replace(/_/g, " ")}
        </p>
        <p className="text-xs text-muted-foreground">
          {session.lastMessageTimestamp
            ? formatDistanceToNowStrict(
                parseISO(session.lastMessageTimestamp),
                { addSuffix: true }
              )
            : "N/A"}
        </p>
      </div>
    </Button>
  )
);

ChatListItem.displayName = "ChatListItem";

export default ChatListItem;
