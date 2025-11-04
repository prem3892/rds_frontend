import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AnimatePresence, motion } from "framer-motion";
import { ChatMessage } from "@/types";
import MessageBubble from "./MessageBubble";
import ChatSkeleton from "./ChatSkeleton";
import { format, parseISO, isToday, isYesterday } from "date-fns";
import { useSocketOperations } from "@/hooks/useSocket";
import { useSelectedChatSessionId } from "@/stores/chat";

interface ChatMessagesProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

const ChatMessages = ({ messages, isLoading }: ChatMessagesProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMarkedMessageRef = useRef<string | null>(null);
  const { markMessagesAsRead } = useSocketOperations();
  const selectedSessionId = useSelectedChatSessionId();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mark messages as read when agent views them
  useEffect(() => {
    if (selectedSessionId && messages.length > 0 && !isLoading) {
      // Get the most recent message to mark all messages up to that point as read
      const latestMessage = messages[messages.length - 1];
      if (latestMessage && latestMessage._id !== lastMarkedMessageRef.current) {
        console.log('Marking messages as read for session:', selectedSessionId, 'latest message:', latestMessage._id);
        lastMarkedMessageRef.current = latestMessage._id;
        markMessagesAsRead({
          chatSessionId: selectedSessionId,
          messageId: latestMessage._id,
        });
      }
    }
  }, [selectedSessionId, messages, isLoading, markMessagesAsRead]);

  // Reset the ref when session changes
  useEffect(() => {
    lastMarkedMessageRef.current = null;
  }, [selectedSessionId]);

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

  const groupConsecutiveMessages = (messages: ChatMessage[]) => {
    if (messages.length === 0) return [];
    
    const groups: { messages: ChatMessage[], showAvatar: boolean, sender: { id: string, type: string } }[] = [];
    let currentGroup: ChatMessage[] = [];
    let currentSender = { id: '', type: '' };
    
    messages.forEach((message, index) => {
      const messageSender = { id: message.senderId, type: message.senderType };
      
      // Start new group if sender changes or it's a system message
      if (
        message.senderType === 'SYSTEM' ||
        messageSender.id !== currentSender.id ||
        messageSender.type !== currentSender.type
      ) {
        // Push previous group if it exists
        if (currentGroup.length > 0) {
          groups.push({
            messages: [...currentGroup],
            showAvatar: true,
            sender: currentSender
          });
        }
        
        // Start new group
        currentGroup = [message];
        currentSender = messageSender;
      } else {
        // Add to current group
        currentGroup.push(message);
      }
    });
    
    // Don't forget the last group
    if (currentGroup.length > 0) {
      groups.push({
        messages: [...currentGroup],
        showAvatar: true,
        sender: currentSender
      });
    }
    
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
      {isLoading && messages.length === 0 && <ChatSkeleton />}
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
            {groupConsecutiveMessages(dateMessages).map((group, groupIndex) => (
              <div key={`group-${groupIndex}`} className="space-y-1">
                {group.messages.map((msg, msgIndex) => (
                  <motion.div
                    key={msg._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <MessageBubble 
                      message={msg} 
                      showAvatar={msgIndex === group.messages.length - 1} 
                      isLastInGroup={msgIndex === group.messages.length - 1}
                      isFirstInGroup={msgIndex === 0}
                    />
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </AnimatePresence>
      <div ref={messagesEndRef} /> {/* For auto-scrolling */}
    </ScrollArea>
  );
};

export default ChatMessages;
