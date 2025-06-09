import React, { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatMessage } from "@/types";
import MessageBubble from "./MessageBubble";

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

  return (
    <ScrollArea
      className="flex-1 p-4 space-y-1 bg-slate-50 dark:bg-slate-900/70 overflow-y-auto"
      id="chat-message-scroll"
    >
      {isLoading && messages.length === 0 && (
        <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading messages...
        </div>
      )}
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
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
      </AnimatePresence>
      <div ref={messagesEndRef} /> {/* For auto-scrolling */}
    </ScrollArea>
  );
};

export default ChatMessages;
