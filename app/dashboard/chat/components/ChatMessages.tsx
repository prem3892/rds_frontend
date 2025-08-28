import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatMessage } from "@/types";
import MessageBubble from "./MessageBubble";
import { format, parseISO, isToday, isYesterday } from "date-fns";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
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

  return (
    <ScrollArea
      className="flex-1 p-4 space-y-1 overflow-y-auto bg-gray-100"
      id="chat-message-scroll"
    >
      {isLoading && messages.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading messages...
        </div>
      )}
      <AnimatePresence initial={false}>
        {Object.entries(messageGroups).map(([dateKey, dateMessages]) => (
          <div key={dateKey} className="space-y-1 ">
            {/* Date Separator */}
            <div className="flex items-center justify-center my-4">
              <div className="bg-gray-200 px-3 py-1 rounded-full">
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
      <div ref={messagesEndRef} /> {/* For auto-scrolling */}
    </ScrollArea>
  );
};

export default ChatMessages;
