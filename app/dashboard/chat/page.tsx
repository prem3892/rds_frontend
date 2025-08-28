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
  MessageInput,
  TypingIndicator,
  GuestFeed,
  GuestInfo,
} from "./components";
import { useSocketOperations } from "@/hooks/useSocket";

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
  const [isGuestInfoOpen, setIsGuestInfoOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobileView();
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

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

  const handleBackToChats = useCallback(() => {
    chatStoreActions.setSelectedSessionId(null);
  }, [chatStoreActions]);

  const handleShowGuestInfo = useCallback(() => {
    setIsGuestInfoOpen(true);
  }, []);

  const handleCloseGuestInfo = useCallback(() => {
    setIsGuestInfoOpen(false);
  }, []);

  const handleBlockGuest = useCallback((sessionId: string) => {
    // Implement block guest functionality
    console.log('Blocking guest:', sessionId);
    handleCloseGuestInfo();
  }, [handleCloseGuestInfo]);

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

  // Mobile view - show only chat when selected, otherwise show sidebar and guest feed
  if (isMobileView) {
    if (selectedSessionDetails) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex h-full overflow-hidden"
        >
          {/* Mobile Chat View */}
          <main className="flex-1 flex flex-col bg-[#f2f4f8] p-5">
            <div className="bg-white rounded-3xl h-full flex flex-col shadow-sm">
              <ChatHeader
                session={selectedSessionDetails}
                onResolve={handleResolveChat}
                onEnd={handleEndChat}
                onBack={handleBackToChats}
                onShowGuestInfo={handleShowGuestInfo}
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
            </div>
          </main>

          {/* Guest Info Drawer */}
          <GuestInfo
            session={selectedSessionDetails}
            isOpen={isGuestInfoOpen}
            onClose={handleCloseGuestInfo}
            onBlockGuest={handleBlockGuest}
          />
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex h-full overflow-hidden"
        >
          {/* Mobile Sidebar */}
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
        </motion.div>
      );
    }
  }

  // Desktop view
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex h-full overflow-hidden"
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
      <main className="flex-1 p-5 bg-[#f2f4f8]">
        {selectedSessionDetails ? (
          <div className="bg-white rounded-3xl h-full flex flex-col shadow-sm overflow-hidden">
            <ChatHeader
              session={selectedSessionDetails}
              onResolve={handleResolveChat}
              onEnd={handleEndChat}
              onShowGuestInfo={handleShowGuestInfo}
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
          </div>
        ) : (
          // Show GuestFeed when no chat is selected
          <GuestFeed maxHeight="h-full" />
        )}
      </main>

      {/* Guest Info Drawer */}
      <GuestInfo
        session={selectedSessionDetails}
        isOpen={isGuestInfoOpen}
        onClose={handleCloseGuestInfo}
        onBlockGuest={handleBlockGuest}
      />
    </motion.div>
  );
}
