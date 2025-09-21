// src/app/(dashboard)/chats/page.tsx
"use client";

import React, { useEffect, useCallback, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetMyActiveChatSessions,
  useGetChatMessages,
  useGetPendingChatSessions,
  useInitiateChatMutation,
  queryClient,
  MY_ACTIVE_CHAT_SESSIONS_QUERY_KEY,
} from "@/lib/api";
import { useBlockCustomerMutation } from "@/lib/blocked-customer.api";
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
  BlockCustomerDialog,
} from "./components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Users } from "lucide-react";
import ChatStatusBanner from "./components/ChatStatusBanner";
import { useSocketOperations } from "@/hooks/useSocket";
import { toast } from "sonner";

// --- Main Page Component ---
export default function MyChatsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: initialActiveSessionsData,
    isLoading: isLoadingInitialSessions,
  } = useGetMyActiveChatSessions();

  const {
    data: initialPendingSessionsData,
    isLoading: isLoadingInitialPendingSessions,
  } = useGetPendingChatSessions();
  
  // Get chat store actions (they are stable in Zustand)
  const chatStoreActions = useChatActions();
  const {
    sendMessage,
    acceptChat,
    sendTypingStart,
    sendTypingStop,
    endChat,
    bookCustomer,
    requestCustomerInfo,
  } = useSocketOperations();

  // Block customer mutation
  const blockCustomerMutation = useBlockCustomerMutation({
    onSuccess: () => {
      console.log("Customer blocked successfully");
      // You might want to show a toast notification here
    },
    onError: (error) => {
      console.error("Failed to block customer:", error);
    },
  });

  // Memoize mutation callbacks to prevent re-renders
  const handleInitiateChatSuccess = useCallback((data: any) => {
    console.log("Chat initiated successfully:", data);
    // Navigate to the new chat session
    const params = new URLSearchParams(searchParams.toString());
    params.set("sessionId", data.chatSessionId);
    router.push(`/dashboard/chat?${params.toString()}`);
    
    // Show success toast
    toast.success(`Chat initiated successfully with ${data.customer.name}`);

    // inavlidate the active sessions 

    queryClient.invalidateQueries({ queryKey: [MY_ACTIVE_CHAT_SESSIONS_QUERY_KEY] });
  }, [searchParams, router]);

  const handleInitiateChatError = useCallback((error: any) => {
    console.error("Failed to initiate chat:", error);
    toast.error(
      error.message || "Failed to initiate chat. Please try again."
    );
  }, []);

  // Wrapper function for requesting customer info
  const handleRequestCustomerInfo = useCallback(async (chatSessionId: string): Promise<boolean> => {
    return requestCustomerInfo({ chatSessionId });
  }, [requestCustomerInfo]);

  // Initiate chat mutation
  const initiateChatMutation = useInitiateChatMutation({
    onSuccess: handleInitiateChatSuccess,
    onError: handleInitiateChatError,
  });


  const activeSessionsMap = useActiveChatSessions();
  const pendingRequests = usePendingChatRequests();
  const selectedSessionId = useSelectedChatSessionId();
  const [isTyping, setIsTyping] = useState(false);
  const [isGuestInfoOpen, setIsGuestInfoOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [mobileActiveTab, setMobileActiveTab] = useState("chats");
  const [isBlockCustomerDialogOpen, setIsBlockCustomerDialogOpen] =
    useState(false);
  const [customerToBlock, setCustomerToBlock] = useState<{
    sessionId: string;
    name: string;
  } | null>(null);
  
  // Use ref to track loaded sessions to prevent infinite loading loops
  const loadedMessagesRef = useRef<Set<string>>(new Set());

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);
    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Load initial active sessions from API into Zustand store
  useEffect(() => {
    if (initialActiveSessionsData) {
      chatStoreActions.loadActiveSessions(initialActiveSessionsData);
    }
  }, [initialActiveSessionsData]);

  // Load initial pending sessions from API into Zustand store
  useEffect(() => {
    if (initialPendingSessionsData) {
      chatStoreActions.loadPendingRequests(initialPendingSessionsData);
    }
  }, [initialPendingSessionsData]);

  // Check for sessionId in URL parameters immediately on page load
  useEffect(() => {
    const sessionId = searchParams.get("sessionId");
    if (!sessionId && selectedSessionId) {
      // If there's no sessionId in URL but we have a selected session, clear it immediately
      chatStoreActions.setSelectedSessionId(null);
    }
  }, [searchParams, selectedSessionId]);

  // Check for sessionId in URL parameters when active sessions are loaded
  useEffect(() => {
    const sessionId = searchParams.get("sessionId");

    if (sessionId && initialActiveSessionsData) {
      // Check if the sessionId exists in active sessions
      const sessionExists = initialActiveSessionsData.some(
        (session) => session._id === sessionId
      );
      if (sessionExists && selectedSessionId !== sessionId) {
        chatStoreActions.setSelectedSessionId(sessionId);
      }
    }
  }, [
    searchParams,
    initialActiveSessionsData,
    selectedSessionId,
  ]);

  const selectedSessionDetails = selectedSessionId
    ? activeSessionsMap[selectedSessionId]
    : null;

  // Fetch messages for the selected session
  const { data: messagesFromApi, isLoading: isLoadingMessagesApi } =
    useGetChatMessages(selectedSessionDetails?._id || null);

  // Load messages from API into the selected session in Zustand store
  useEffect(() => {
    if (messagesFromApi && selectedSessionId && selectedSessionDetails) {
      // Check if we've already loaded messages for this session to prevent infinite loops
      const sessionKey = `${selectedSessionId}-${messagesFromApi.length}`;
      
      if (!loadedMessagesRef.current.has(sessionKey)) {
        const currentMessageCount = selectedSessionDetails.messages?.length || 0;
        const apiMessageCount = messagesFromApi.length;
        
        if (currentMessageCount === 0 || currentMessageCount < apiMessageCount) {
          chatStoreActions.loadMessagesForSession(selectedSessionId, messagesFromApi);
          loadedMessagesRef.current.add(sessionKey);
        }
      }
    }
    // Only depend on messagesFromApi and selectedSessionId - not selectedSessionDetails
  }, [messagesFromApi, selectedSessionId]);

  // Clear loaded messages ref when session changes
  useEffect(() => {
    loadedMessagesRef.current.clear();
  }, [selectedSessionId]);

  const handleAcceptChat = useCallback(
    (sessionId: string) => {
      acceptChat(sessionId);
      // Update URL with sessionId parameter
      const params = new URLSearchParams(searchParams.toString());
      params.set("sessionId", sessionId);
      router.push(`/dashboard/chat?${params.toString()}`);
    },
    [acceptChat, router, searchParams]
  );

  const handleSelectSession = useCallback(
    (sessionId: string) => {
      chatStoreActions.setSelectedSessionId(sessionId);
      // Update URL with sessionId parameter
      const params = new URLSearchParams(searchParams.toString());
      params.set("sessionId", sessionId);
      router.push(`/dashboard/chat?${params.toString()}`);
    },
    [router, searchParams]
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
    // Clear sessionId from URL when going back to chats
    const params = new URLSearchParams(searchParams.toString());
    params.delete("sessionId");
    const queryString = params.toString();
    router.push(`/dashboard/chat${queryString ? `?${queryString}` : ""}`);
  }, [router, searchParams]);

  const handleShowGuestInfo = useCallback(() => {
    setIsGuestInfoOpen(true);
  }, []);

  const handleCloseGuestInfo = useCallback(() => {
    setIsGuestInfoOpen(false);
  }, []);

  const handleCloseBlockCustomerDialog = useCallback(() => {
    setIsBlockCustomerDialogOpen(false);
    setCustomerToBlock(null);
  }, []);

  const handleBlockCustomer = useCallback(
    (sessionId: string) => {
      const session = activeSessionsMap[sessionId];
      if (!session || !session.customerId) {
        console.error("No customer found for session:", sessionId);
        return;
      }

      // Get customer name for display
      const customerName =
        typeof session.customerId === "object"
          ? session.customerId.name || session.customerId.email || "Customer"
          : "Customer";

      // Open the confirmation dialog
      setCustomerToBlock({ sessionId, name: customerName });
      setIsBlockCustomerDialogOpen(true);
    },
    [activeSessionsMap]
  );

  const handleConfirmBlockCustomer = useCallback(() => {
    if (!customerToBlock) return;

    const session = activeSessionsMap[customerToBlock.sessionId];
    if (!session || !session.customerId) {
      console.error(
        "No customer found for session:",
        customerToBlock.sessionId
      );
      return;
    }

    // Extract customer fingerprint
    const customerId =
      typeof session.customerId === "object"
        ? session.customerId._id
        : session.customerId;

    // Use the block customer mutation
    blockCustomerMutation.mutate(
      { customerId },
      {
        onSuccess: () => {
          // Close the dialog
          setIsBlockCustomerDialogOpen(false);
          setCustomerToBlock(null);
          // Optionally end the chat after blocking
          handleEndChat(customerToBlock.sessionId);
        },
      }
    );
  }, [
    customerToBlock,
    activeSessionsMap,
    blockCustomerMutation,
    handleEndChat,
  ]);

  const handleInitiateChat = useCallback(
    (visitorId: string) => {
      // Look for an existing active session with this customer
      const existingSession = Object.values(activeSessionsMap).find(
        (session) => {
          const customerId =
            typeof session.customerId === "object"
              ? session.customerId._id
              : session.customerId;
          return customerId === visitorId;
        }
      );

      if (existingSession) {
        // If we found an existing session, select it and navigate properly
        handleSelectSession(existingSession._id);
        console.log(
          `Found existing session for visitor ${visitorId}:`,
          existingSession._id
        );
      } else {
        // No existing session found, initiate a new chat
        console.log(`Initiating new chat session for visitor ${visitorId}`);
        
        // Call the initiate chat mutation
        initiateChatMutation.mutate({
          customerId: visitorId,
        });
      }
    },
    [activeSessionsMap, handleSelectSession, initiateChatMutation]
  );

  const activeSessionsArray = Object.values(activeSessionsMap).sort(
    (a, b) =>
      new Date(b.lastMessageAt || b.updatedAt).getTime() -
      new Date(a.lastMessageAt || a.updatedAt).getTime()
  );

  const pendingRequestsSorted = [...pendingRequests].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const getCustomerName = () => {
    if (!selectedSessionDetails) return "Customer";

    return typeof selectedSessionDetails.customerId === "object"
      ? selectedSessionDetails.customerId?.name || "Customer"
      : "Customer";
  };

  // Mobile view - show only chat when selected, otherwise show sidebar
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
          <main className="flex-1 flex flex-col bg-[#f2f4f8] rounded-3xl p-2 sm:p-5">
            <div className="bg-white rounded-3xl h-full flex flex-col shadow-sm">
              <ChatHeader
                session={selectedSessionDetails}
                onResolve={handleResolveChat}
                onEnd={handleEndChat}
                onBack={handleBackToChats}
                onShowGuestInfo={handleShowGuestInfo}
                onBlockCustomer={handleBlockCustomer}
              />

              <ChatMessages
                messages={selectedSessionDetails.messages || []}
                isLoading={
                  isLoadingMessagesApi ||
                  selectedSessionDetails.isLoadingMessages
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
                onRequestCustomerInfo={handleRequestCustomerInfo}
              />
            </div>
          </main>

          {/* Guest Info Drawer */}
          <GuestInfo
            session={selectedSessionDetails}
            isOpen={isGuestInfoOpen}
            onClose={handleCloseGuestInfo}
            onBlockGuest={handleBlockCustomer}
          />

          {/* Block Customer Dialog */}
          <BlockCustomerDialog
            open={isBlockCustomerDialogOpen}
            onOpenChange={handleCloseBlockCustomerDialog}
            onConfirm={handleConfirmBlockCustomer}
            customerName={customerToBlock?.name || "Customer"}
            isLoading={blockCustomerMutation.isPending}
          />
        </motion.div>
      );
    } else {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex h-full overflow-hidden bg-[#f2f4f8] rounded-3xl p-2 sm:p-5"
        >
          <div className="bg-white rounded-3xl h-full flex flex-col shadow-sm w-full">
            <Tabs value={mobileActiveTab} onValueChange={setMobileActiveTab} className="w-full h-full flex flex-col">
              <div className="p-4 pb-0">
                <div className="bg-gray-200 rounded-lg p-1 shadow-inner">
                  <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-1">
                    <TabsTrigger 
                      value="chats" 
                      className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-600 hover:bg-white/50 transition-all duration-200 rounded-md px-3 py-2 border-0 data-[state=active]:shadow-sm"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                        {activeSessionsArray.length + pendingRequestsSorted.length}
                      </span>
                      Recent Chats
                    </TabsTrigger>
                    <TabsTrigger 
                      value="guests" 
                      className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-600 hover:bg-white/50 transition-all duration-200 rounded-md px-3 py-2 border-0 data-[state=active]:shadow-sm"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Guest Feed
                    </TabsTrigger>
                  </TabsList>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="chats" className="mt-0 h-full">
                  <ChatSidebar
                    activeSessions={activeSessionsArray}
                    pendingSessions={pendingRequestsSorted}
                    selectedSessionId={selectedSessionId}
                    onSelectSession={handleSelectSession}
                    onAcceptChat={handleAcceptChat}
                    isLoading={isLoadingInitialSessions}
                  />
                </TabsContent>

                <TabsContent value="guests" className="mt-0 h-full">
                  <div className="h-full flex flex-col">
                    <GuestFeed 
                      maxHeight="flex-1" 
                      onInitiateChat={handleInitiateChat} 
                      onSelectChat={handleSelectSession} 
                      className="h-full flex flex-col"
                      initiatingChatForCustomer={initiateChatMutation.isPending ? initiateChatMutation.variables?.customerId : null}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
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
      className="mx-auto   space-y-6 flex bg-[#f2f4f8] rounded-3xl h-full"
    >
      {/* Chat Sidebar */}
      <ChatSidebar
        activeSessions={activeSessionsArray}
        pendingSessions={pendingRequestsSorted}
        selectedSessionId={selectedSessionId}
        onSelectSession={handleSelectSession}
        onAcceptChat={handleAcceptChat}
        isLoading={isLoadingInitialSessions}
      />

      {/* Main Chat View Area */}
      <main className="flex-1  bg-[#f2f4f8] p-4">
        {selectedSessionDetails ? (
          <div className="bg-white rounded-3xl h-full flex flex-col shadow-sm overflow-hidden">
            <ChatHeader
              session={selectedSessionDetails}
              onResolve={handleResolveChat}
              onEnd={handleEndChat}
              onBack={handleBackToChats}
              onShowGuestInfo={handleShowGuestInfo}
              onBlockCustomer={handleBlockCustomer}
            />

            {/* Real-time Status Banner */}
            <ChatStatusBanner
              status={selectedSessionDetails.status}
              customerName={getCustomerName()}
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
              onRequestCustomerInfo={handleRequestCustomerInfo}
            />
          </div>
        ) : (
          // Show GuestFeed when no chat is selected
          <GuestFeed 
            maxHeight="h-full" 
            onInitiateChat={handleInitiateChat} 
            onSelectChat={handleSelectSession}
            initiatingChatForCustomer={initiateChatMutation.isPending ? initiateChatMutation.variables?.customerId : null}
          />
        )}
      </main>

      {/* Guest Info Drawer */}
      <GuestInfo
        session={selectedSessionDetails}
        isOpen={isGuestInfoOpen}
        onClose={handleCloseGuestInfo}
        onBlockGuest={handleBlockCustomer}
      />

      {/* Block Customer Dialog */}
      <BlockCustomerDialog
        open={isBlockCustomerDialogOpen}
        onOpenChange={handleCloseBlockCustomerDialog}
        onConfirm={handleConfirmBlockCustomer}
        customerName={customerToBlock?.name || "Customer"}
        isLoading={blockCustomerMutation.isPending}
      />
    </motion.div>
  );
}
