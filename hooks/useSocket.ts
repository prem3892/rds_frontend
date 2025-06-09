// hooks/useSocket.ts
import { useEffect, useCallback } from "react";
import { socketService } from "@/services/socketService";
import { useAuthStore } from "@/stores/auth";
import { useChatActions } from "@/stores/chat";
import { ChatMessage } from "@/types";

// Hook for initializing the socket only once
export function useSocketInitializer() {
  const { accessToken, user, actions: authActions } = useAuthStore();
  const chatActions = useChatActions();

  useEffect(() => {
    if (
      accessToken &&
      user &&
      (user.role === "AGENT" || user.role === "ADMIN")
    ) {
      // Initialize socket
      const socket = socketService.initialize(accessToken);
      if (socket) chatActions.setSocket(socket);

      // Set up handlers for socket events
      const removeListener = socketService.addListener((event, data) => {
        switch (event) {
          case "connected":
            chatActions.setConnected(data);
            break;
          case "authenticated":
            // Handle authenticated event if needed
            break;
          case "authFailed":
            // Handle auth failed (could show toast here)
            break;
          case "newMessage":
            chatActions.addMessageToSession(data.chatSessionId, data);
            break;
          case "newChatRequest":
            chatActions.addPendingRequest(data);
            break;
          case "chatSessionUpdate":
            chatActions.updateActiveSessionStatus(
              data.chatSessionId,
              data.status,
              data
            );
            if (data.status !== "PENDING_ASSIGNMENT") {
              chatActions.removePendingRequest(data.chatSessionId);
            }
            break;
          case "chatAcceptedByYou":
            chatActions.removePendingRequest(data._id);
            chatActions.addActiveSession(data);
            chatActions.setSelectedSessionId(data._id);
            break;
          case "chatTakenOrResolved":
            chatActions.removePendingRequest(data.chatSessionId);
            break;
          case "onlineStatusUpdated":
            authActions.setOnlineStatus(data.isOnline);
            break;
          case "customerTypingStart":
            chatActions.setCustomerTypingStatus(data.chatSessionId, true);
            break;
          case "customerTypingStop":
            chatActions.setCustomerTypingStatus(data.chatSessionId, false);
            break;
        }
      });

      // No cleanup function - we want the socket to persist globally
      return () => {
        // Only remove the listener, not the socket connection
        removeListener();
      };
    }
  }, [accessToken, user, chatActions, authActions]);

  return null;
}

// Hook for socket operations that components can use
export function useSocketOperations() {
  // Move this to the top level of the hook
  const chatActions = useChatActions();

  const sendMessage = useCallback(
    (payload: {
      chatSessionId: string;
      messageContent: ChatMessage["content"];
    }) => {
      return socketService.sendMessage(payload);
    },
    []
  );

  const acceptChat = useCallback((chatSessionId: string) => {
    return socketService.acceptChat(chatSessionId);
  }, []);

  const setOnlineStatus = useCallback((isOnline: boolean) => {
    return socketService.setOnlineStatus(isOnline);
  }, []);

  const sendTypingStart = useCallback(
    (chatSessionId: string) => {
      const success = socketService.sendTypingStart(chatSessionId);
      if (success) {
        // Update typing state using the chatActions from the top level
        chatActions.setAgentTypingStatus(chatSessionId, true);
      }
      return success;
    },
    [chatActions]
  ); // Add chatActions as a dependency

  const sendTypingStop = useCallback(
    (chatSessionId: string) => {
      const success = socketService.sendTypingStop(chatSessionId);
      if (success) {
        // Update typing state using the chatActions from the top level
        chatActions.setAgentTypingStatus(chatSessionId, false);
      }
      return success;
    },
    [chatActions]
  ); // Add chatActions as a dependency

  return {
    sendMessage,
    acceptChat,
    setOnlineStatus,
    sendTypingStart,
    sendTypingStop,
    isConnected: socketService.isConnected,
    socket: socketService.instance,
  };
}

// Global component for socket initialization
export function GlobalSocketInitializer() {
  useSocketInitializer();
  return null;
}
