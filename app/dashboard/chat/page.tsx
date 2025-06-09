// src/app/(dashboard)/chats/page.tsx
"use client";

import React, { useEffect, useCallback, useState } from "react";
import { motion } from "framer-motion";
import { useGetMyActiveChatSessions, useGetChatMessages } from "@/lib/api";
import {
  useChatActions,
  useActiveChatSessions,
  useSelectedChatSessionId,
  usePendingChatRequests,
} from "@/stores/chat";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import {
  ChatHeader,
  ChatMessages,
  ChatSidebar,
  EmptyChatState,
  MessageInput,
  TypingIndicator,
} from "./components";

// --- Main Page Component ---
export default function MyChatsPage() {
  const {
    data: initialActiveSessionsData,
    isLoading: isLoadingInitialSessions,
  } = useGetMyActiveChatSessions();
  const chatStoreActions = useChatActions();
  const { sendMessage, acceptChat, sendTypingStart, sendTypingStop } =
    useChatWebSocket();

  const activeSessionsMap = useActiveChatSessions();
  const pendingRequests = usePendingChatRequests();
  const selectedSessionId = useSelectedChatSessionId();
  const [isTyping, setIsTyping] = useState(false);

  // Load initial active sessions from API into Zustand store
  useEffect(() => {
    if (initialActiveSessionsData) {
      chatStoreActions.loadActiveSessions(initialActiveSessionsData);
    }
  }, [initialActiveSessionsData, chatStoreActions]);

  const selectedSessionDetails = selectedSessionId
    ? activeSessionsMap[selectedSessionId]
    : null;

  // Fetch messages for the selected session
  const { data: messagesFromApi, isLoading: isLoadingMessagesApi } =
    useGetChatMessages(selectedSessionDetails?._id || null);

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

  const handleAcceptChat = useCallback(
    (sessionId: string) => {
      acceptChat(sessionId);
    },
    [acceptChat]
  );

  const handleSendMessage = useCallback(
    (message: string) => {
      if (selectedSessionId && selectedSessionDetails?.status === "ACTIVE") {
        sendMessage({
          chatSessionId: selectedSessionId,
          messageContent: { text: message },
        });
      }
    },
    [selectedSessionId, selectedSessionDetails, sendMessage]
  );

  const handleTypingStart = useCallback(
    (sessionId: string) => {
      if (!isTyping) {
        setIsTyping(true);
        sendTypingStart(sessionId);
      }
    },
    [isTyping, sendTypingStart]
  );

  const handleTypingStop = useCallback(
    (sessionId: string) => {
      if (isTyping) {
        setIsTyping(false);
        sendTypingStop(sessionId);
      }
    },
    [isTyping, sendTypingStop]
  );

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

  const getCustomerName = () => {
    if (!selectedSessionDetails) return "Customer";

    return typeof selectedSessionDetails.customerId === "object"
      ? selectedSessionDetails.customerId?.firstName || "Customer"
      : "Customer";
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-[calc(100vh-var(--header-height,4rem))] overflow-hidden bg-muted/30 dark:bg-slate-900/50"
    >
      {/* Sidebar */}
      <ChatSidebar
        activeSessions={activeSessionsArray}
        pendingSessions={pendingRequestsSorted}
        selectedSessionId={selectedSessionId}
        onSelectSession={(sessionId) =>
          chatStoreActions.setSelectedSessionId(sessionId)
        }
        onAcceptChat={handleAcceptChat}
        isLoading={isLoadingInitialSessions}
      />

      {/* Main Chat View Area */}
      <main className="flex-1 flex flex-col bg-background dark:bg-slate-800">
        {selectedSessionDetails ? (
          <>
            <ChatHeader
              session={selectedSessionDetails}
              onResolve={handleResolveChat}
              onEnd={handleEndChat}
            />

            <ChatMessages
              messages={selectedSessionDetails.messages || []}
              isLoading={
                isLoadingMessagesApi || selectedSessionDetails.isLoadingMessages
              }
            />

            <TypingIndicator
              isTyping={!!selectedSessionDetails.typing?.customer}
              customerName={getCustomerName()}
            />

            <MessageInput
              disabled={selectedSessionDetails.status !== "ACTIVE"}
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
              sessionId={selectedSessionId}
            />
          </>
        ) : (
          <EmptyChatState />
        )}
      </main>
    </motion.div>
  );
}
