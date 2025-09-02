import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { ChatMessage } from "@/types";
import MessageBubble from "../../chat/components/MessageBubble";
import ChatSkeleton from "../../chat/components/ChatSkeleton";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { HistoryChatMessagesSkeleton } from "./history-chat-messages-skeleton";

interface HistoryChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const HistoryChatMessages = ({ messages, isLoading }: HistoryChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const groupMessagesByDate = (messages: ChatMessage[]) => {
    const groups: { [key: string]: ChatMessage[] } = {};
    
    messages.forEach((message) => {
      const date = parseISO(message.timestamp);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(message);
    });
    
    return groups;
  };

  const getDateDisplay = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return "Today";
    } else if (isYesterday(date)) {
      return "Yesterday";
    } else {
      return format(date, 'M/d/yyyy');
    }
  };

  const messageGroups = groupMessagesByDate(messages);

  if (isLoading && messages.length === 0) {
    return <HistoryChatMessagesSkeleton />;
  }

  return (
    <div className="h-full overflow-hidden">
      <ScrollArea
        className="h-full p-2 sm:p-4 space-y-1 bg-gray-50"
        id="history-chat-message-scroll"
      >
        <AnimatePresence initial={false}>
          {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
            <div key={dateKey} className="space-y-1">
              {/* Date Separator */}
              <div className="flex items-center justify-center my-3 sm:my-4">
                <div className="bg-gray-200 px-2 sm:px-3 py-1 rounded-full">
                  <span className="text-xs text-gray-600 font-medium">
                    {getDateDisplay(dateMessages[0].timestamp)}
                  </span>
                </div>
              </div>
              
              {/* Messages for this date */}
              {dateMessages.map((msg) => (
                <motion.div
                  key={msg._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MessageBubble message={msg} />
                </motion.div>
              ))}
            </div>
          ))}
        </AnimatePresence>
        
        {!isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-32">
            <div className="text-center text-gray-500">
              <p className="text-sm">No messages in this conversation.</p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
      </ScrollArea>
    </div>
  );
};

export default HistoryChatMessages;
