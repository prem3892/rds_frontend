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

import {
  ChatHeader,
  ChatMessages,
  ChatSidebar,
  EmptyChatState,
  MessageInput,
  TypingIndicator,
  VisitorsList,
} from "./components";
import { useSocketOperations } from "@/hooks/useSocket";
import { Button } from "@/components/ui/button";
import { Users, X } from "lucide-react";

// --- Main Page Component ---
export default function MyChatsPage() {
  const {
    data: initialActiveSessionsData,
    isLoading: isLoadingInitialSessions,
  } = useGetMyActiveChatSessions();
  const chatStoreActions = useChatActions();
  const {
    sendMessage,
    acceptChat,
    sendTypingStart,
    sendTypingStop,
    endChat,
    bookCustomer,
  } = useSocketOperations();

  const activeSessionsMap = useActiveChatSessions();
  const pendingRequests = usePendingChatRequests();
  const selectedSessionId = useSelectedChatSessionId();
  const [isTyping, setIsTyping] = useState(false);
  const [isVisitorsPanelVisible, setIsVisitorsPanelVisible] = useState(false);

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

  const handleEndChat = useCallback(
    (sessionId: string) => {
      endChat(sessionId);
    },
    [endChat]
  );

  const handleResolveChat = useCallback(
    (payload: { chatSessionId: string; date: string; notes?: string }) => {
      bookCustomer(payload);
    },
    [bookCustomer]
  );

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
      className="flex h-full overflow-hidden bg-muted/30 dark:bg-slate-900/50"
    >
      {/* Chat Sidebar */}
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
      <main
        className={`flex-1 flex flex-col bg-background dark:bg-slate-800 ${
          selectedSessionDetails ? "relative" : ""
        }`}
      >
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

            {/* Visitors Panel Toggle Button */}
            {!isVisitorsPanelVisible && (
              <Button
                onClick={() => setIsVisitorsPanelVisible(true)}
                className="absolute top-4 right-4 z-10"
                variant="outline"
                size="sm"
              >
                <Users className="h-4 w-4 mr-2" />
                Visitors
              </Button>
            )}
          </>
        ) : (
          // Show only VisitorsList when no chat is selected
          <div className="flex-1 p-4">
            <VisitorsList maxHeight="h-full" />
          </div>
        )}
      </main>

      {/* Visitors Panel - Conditionally visible */}
      {selectedSessionDetails && isVisitorsPanelVisible && (
        <aside className="border-l bg-background dark:bg-slate-800 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="font-semibold">Visitors</h3>
            <Button
              onClick={() => setIsVisitorsPanelVisible(false)}
              variant="ghost"
              size="sm"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1">
            <VisitorsList />
          </div>
        </aside>
      )}
    </motion.div>
  );
}
