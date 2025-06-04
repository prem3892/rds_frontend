// src/app/(dashboard)/chats/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useGetMyActiveChatSessions, useGetChatMessages } from "@/lib/api";
import {
  useChatStore,
  useChatActions,
  useActiveChatSessions,
  useSelectedChatSessionId,
  usePendingChatRequests,
} from "@/stores/chat";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"; // Ensure Card components are imported
import { format, parseISO, formatDistanceToNowStrict } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  UserCircle,
  MessageSquarePlus,
  CheckCircle2,
  XCircle,
  AlertTriangle, // For pending requests
  Loader2, // For loading states
} from "lucide-react";
import { ChatMessage, ChatSession } from "@/types";
import { useCurrentUser } from "@/stores/auth"; // For user context if needed

// --- Helper Components ---

// Individual Message Bubble
const MessageBubble = React.memo(({ message }: { message: ChatMessage }) => {
  const currentUser = useCurrentUser();
  // Determine if the message is from the currently logged-in agent/admin
  // Note: senderId for agent might be user.id, ensure consistency
  const isOwnMessage =
    message.senderType === "AGENT" && message.senderId === currentUser?.id;
  const isSystem = message.senderType === "SYSTEM";

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-muted-foreground rounded-full">
          {message.content.text || "System Notification"}
          {message.content.appointmentDetails && (
            <span className="block text-xxs">
              Appointment:{" "}
              {format(
                parseISO(message.content.appointmentDetails.appointmentTime),
                "Pp"
              )}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex my-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
          isOwnMessage
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-background border dark:border-slate-700 rounded-bl-none"
          // Using bg-background for non-own messages to match typical chat UIs better
        }`}
      >
        {!isOwnMessage &&
          message.senderType === "AGENT" && ( // If another agent sent message (e.g. transferred chat)
            <p className="text-xs font-semibold mb-1 opacity-70">
              Agent: {message.senderId.slice(-4)}
            </p>
          )}
        <p className="text-sm whitespace-pre-wrap">
          {message.content.text || JSON.stringify(message.content)}
        </p>
        <p
          className={`text-xs mt-1 ${
            isOwnMessage
              ? "text-blue-200 dark:text-sky-300"
              : "text-muted-foreground/80"
          } text-right`}
        >
          {format(parseISO(message.timestamp), "HH:mm")}
        </p>
      </div>
    </div>
  );
});
MessageBubble.displayName = "MessageBubble";

// Chat Session Item in the List
const ChatListItem = React.memo(
  ({
    session,
    isSelected,
    onSelect,
  }: {
    session: ChatSession & {
      unreadCount?: number;
      lastMessagePreview?: string;
    };
    isSelected: boolean;
    onSelect: () => void;
  }) => (
    <Button
      variant={isSelected ? "secondary" : "ghost"}
      className="w-full justify-start p-3 h-auto mb-1 flex items-start text-left"
      onClick={onSelect}
    >
      <Avatar className="h-10 w-10 mr-3 flex-shrink-0">
        <AvatarImage src={undefined /* session.customer?.avatarUrl */} />
        <AvatarFallback className="text-sm">
          {session.customer?.firstName?.charAt(0)?.toUpperCase() ||
            session.customer?.email?.charAt(0)?.toUpperCase() ||
            "C"}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <span className="font-semibold text-sm truncate block">
            {session.customer?.firstName ||
              session.customer?.email ||
              session.customerId.slice(-6)}
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

// --- Main Page Component ---
export default function MyChatsPage() {
  const {
    data: initialActiveSessionsData,
    isLoading: isLoadingInitialSessions,
  } = useGetMyActiveChatSessions();
  const chatStoreActions = useChatActions();
  const {
    sendMessage,
    acceptChat /*, endChat, resolveChat, sendTypingStart, sendTypingStop */,
  } = useChatWebSocket(); // Get emitters

  const activeSessionsMap = useActiveChatSessions(); // Zustand store: Record<string, ActiveChat>
  const pendingRequests = usePendingChatRequests(); // Zustand store: ChatSession[]
  const selectedSessionId = useSelectedChatSessionId(); // Zustand store: string | null

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  const textareaRef = useRef<null | HTMLTextAreaElement>(null);

  // Load initial active sessions from API into Zustand store
  useEffect(() => {
    if (initialActiveSessionsData) {
      chatStoreActions.loadActiveSessions(initialActiveSessionsData);
    }
  }, [initialActiveSessionsData, chatStoreActions]);

  const selectedSessionDetails = selectedSessionId
    ? activeSessionsMap[selectedSessionId]
    : null;

  // Fetch messages for the selected session (all messages, no pagination)
  const {
    data: messagesFromApi,
    isLoading: isLoadingMessagesApi,
    refetch: refetchMessagesFromApi,
  } = useGetChatMessages(selectedSessionDetails?._id || null);

  // Load messages from API into the selected session in Zustand store
  useEffect(() => {
    if (messagesFromApi && selectedSessionId && selectedSessionDetails) {
      // Check if messages in store are different or fewer than API to avoid overwriting WS messages
      if (
        !selectedSessionDetails.messages.length ||
        selectedSessionDetails.messages.length < messagesFromApi.length
      ) {
        chatStoreActions.loadMessagesForSession(
          selectedSessionId,
          messagesFromApi
        );
      }
    }
  }, [
    messagesFromApi,
    selectedSessionId,
    chatStoreActions,
    selectedSessionDetails,
  ]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedSessionDetails?.messages]); // Trigger on messages change for the selected session

  const handleSendMessage = () => {
    if (
      newMessage.trim() &&
      selectedSessionId &&
      selectedSessionDetails?.status === "ACTIVE"
    ) {
      sendMessage({
        chatSessionId: selectedSessionId,
        messageContent: { text: newMessage.trim() },
      });
      setNewMessage("");
      textareaRef.current?.focus();
    }
  };

  const handleAcceptChat = (sessionId: string) => {
    acceptChat(sessionId);
  };

  // TODO: Implement these actions
  const handleEndChat = (sessionId: string) => {
    console.log("TODO: End chat", sessionId);
    // socket.emit('agent:end_chat', { chatSessionId: sessionId });
  };
  const handleResolveChat = (sessionId: string) => {
    console.log("TODO: Resolve chat", sessionId);
    // socket.emit('agent:resolve_chat', { chatSessionId: sessionId });
  };

  const activeSessionsArray = Object.values(activeSessionsMap).sort(
    (a, b) =>
      new Date(b.lastMessageTimestamp || b.updatedAt).getTime() -
      new Date(a.lastMessageTimestamp || a.updatedAt).getTime()
  );
  const pendingRequestsSorted = [...pendingRequests].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-[calc(100vh-var(--header-height,4rem))] overflow-hidden bg-muted/30 dark:bg-slate-900/50"
    >
      {/* Sidebar for Active and Pending Chats */}
      <aside className="w-80 xl:w-96 border-r flex flex-col bg-background dark:bg-slate-800 dark:border-slate-700">
        <div className="p-4 border-b dark:border-slate-700">
          <h2 className="text-xl font-semibold">My Chats</h2>
        </div>

        {/* Pending Requests */}
        {pendingRequestsSorted.length > 0 && (
          <div className="p-2 border-b dark:border-slate-700">
            <h3 className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
              Pending Requests ({pendingRequestsSorted.length})
            </h3>
            <ScrollArea className="h-auto max-h-60">
              {" "}
              {/* Adjust max height */}
              {pendingRequestsSorted.map((session) => (
                <Card
                  key={session._id}
                  className="mb-2 p-3 hover:shadow-md transition-shadow cursor-pointer bg-amber-50 dark:bg-amber-800/20 border-amber-500 dark:border-amber-600"
                  onClick={() => handleAcceptChat(session._id)}
                >
                  <div className="flex justify-between w-full items-center mb-1">
                    <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
                      {session.customer?.firstName ||
                        session.customer?.email ||
                        session.customerId.slice(-6)}
                    </span>
                    <Badge
                      variant="destructive"
                      className="bg-amber-500 text-amber-50"
                    >
                      NEW
                    </Badge>
                  </div>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    Dept:{" "}
                    {session.department?.name ||
                      session.departmentId?.slice(-6) ||
                      "N/A"}
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-500">
                    {formatDistanceToNowStrict(parseISO(session.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </Card>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* Active Chats List */}
        <ScrollArea className="flex-1 p-2">
          {isLoadingInitialSessions && activeSessionsArray.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading active
              chats...
            </div>
          )}
          {!isLoadingInitialSessions &&
            activeSessionsArray.length === 0 &&
            pendingRequestsSorted.length === 0 && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No active or pending chats.
              </p>
            )}
          {activeSessionsArray.map((session) => (
            <ChatListItem
              key={session._id}
              session={session}
              isSelected={selectedSessionId === session._id}
              onSelect={() =>
                chatStoreActions.setSelectedSessionId(session._id)
              }
            />
          ))}
        </ScrollArea>
      </aside>

      {/* Main Chat View Area */}
      <main className="flex-1 flex flex-col">
        {selectedSessionDetails ? (
          <>
            <header className="p-3.5 border-b bg-background dark:bg-slate-800 dark:border-slate-700 flex justify-between items-center shadow-sm">
              <div className="flex items-center">
                <Avatar className="h-9 w-9 mr-3">
                  <AvatarImage
                    src={
                      undefined /* selectedSessionDetails.customer?.avatarUrl */
                    }
                  />
                  <AvatarFallback>
                    {selectedSessionDetails.customer?.firstName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      selectedSessionDetails.customer?.email
                        ?.charAt(0)
                        ?.toUpperCase() ||
                      "C"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-md leading-tight">
                    {selectedSessionDetails.customer?.firstName ||
                      selectedSessionDetails.customer?.email ||
                      selectedSessionDetails.customerId.slice(-6)}
                  </h3>
                  <Badge
                    variant={
                      selectedSessionDetails.status === "ACTIVE"
                        ? "default"
                        : "outline"
                    }
                    className="text-xs py-0 px-1.5 h-5"
                  >
                    {selectedSessionDetails.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResolveChat(selectedSessionDetails._id)}
                  disabled={selectedSessionDetails.status !== "ACTIVE"}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" /> Resolve
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleEndChat(selectedSessionDetails._id)}
                  disabled={selectedSessionDetails.status !== "ACTIVE"}
                >
                  <XCircle className="h-4 w-4 mr-1.5" /> End Chat
                </Button>
              </div>
            </header>

            <ScrollArea
              className="flex-1 p-4 space-y-1 bg-slate-50 dark:bg-slate-900/70"
              id="chat-message-scroll"
            >
              {(isLoadingMessagesApi ||
                selectedSessionDetails.isLoadingMessages) &&
                selectedSessionDetails.messages?.length === 0 && (
                  <div className="p-4 text-center text-sm text-muted-foreground flex items-center justify-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading
                    messages...
                  </div>
                )}
              <AnimatePresence initial={false}>
                {selectedSessionDetails.messages?.map((msg) => (
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

            {selectedSessionDetails.typing?.customer && ( // Only show customer typing
              <div className="px-4 pt-1 pb-0.5 text-xs text-muted-foreground italic">
                {`${
                  selectedSessionDetails.customer?.firstName || "Customer"
                } is typing... `}
              </div>
            )}

            <footer className="p-3 border-t bg-background dark:bg-slate-800 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <Textarea
                  ref={textareaRef}
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    // TODO: Emit typing start/stop
                    // if (e.target.value.length > 0 && !isTyping) sendTypingStart(selectedSessionId);
                    // if (e.target.value.length === 0 && isTyping) sendTypingStop(selectedSessionId);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  rows={1}
                  className="flex-1 resize-none min-h-[40px] max-h-[120px] text-sm"
                  disabled={selectedSessionDetails.status !== "ACTIVE"}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={
                    !newMessage.trim() ||
                    selectedSessionDetails.status !== "ACTIVE"
                  }
                  size="icon"
                  className="h-9 w-9"
                >
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-slate-50 dark:bg-slate-900/70">
            <MessageSquarePlus className="h-16 w-16 mb-4 opacity-30" />
            <p className="text-lg font-medium">
              Select a chat to view messages
            </p>
            <p className="text-sm">
              Or accept a new pending request from the sidebar.
            </p>
          </div>
        )}
      </main>
    </motion.div>
  );
}
