// hooks/useSocket.ts
import { useEffect, useCallback } from "react";
import { socketService } from "@/services/socketService";
import { useAuthStore } from "@/stores/auth";
import { useChatActions, useActiveChatSessions } from "@/stores/chat";
import { useVisitorActions } from "@/stores/visitor";
import { useNotifications } from "@/hooks/useNotifications";
import { useToastNotifications } from "@/hooks/useToastNotifications";
import { ChatMessage, VisitorActivityEvent } from "@/types";
import { toast } from "sonner";

// Hook for initializing the socket only once
export function useSocketInitializer() {
  const { accessToken, user, actions: authActions } = useAuthStore();
  const chatActions = useChatActions();
  const visitorActions = useVisitorActions();
  const activeSessions = useActiveChatSessions();
  const { showMessageNotification, showChatRequestNotification } = useNotifications();
  const { showMessageToast, showChatRequestToast } = useToastNotifications();

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
            // Authentication successful - no automatic status restoration
            // The user's online status will remain as stored in Zustand
            // They can manually change it if needed without triggering server notifications
            console.log("Socket authenticated successfully");
            break;
          case "authFailed":
            // Handle auth failed (could show toast here)
            break;
          case "newMessage":
            chatActions.addMessageToSession(data.chatSessionId, data);
            // Show notification and toast for incoming customer messages
            const session = activeSessions[data.chatSessionId];
            if (session && data.senderType === "CUSTOMER") {
              // Show push notification
              showMessageNotification(data, session).catch(console.error);
              // Show toast notification
              showMessageToast(data, session);
            }
            break;
          case "newChatRequest":
            chatActions.addPendingRequest(data);
            // Show notification and toast for new chat requests
            showChatRequestNotification(data).catch(console.error);
            showChatRequestToast(data);
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
            // Update the online status in the store and persist it
            // This handles status changes from other devices
            authActions.setOnlineStatus(data.isOnline);
            console.log(`Online status synchronized from server: ${data.isOnline ? "Online" : "Offline"}`);
            toast.success('Status updated', {
              description: 'Your status has been changed to ' + (data.isOnline ? 'Online' : 'Offline'),
            });
            break;
          case "agentPoolStatusUpdate":
            // Handle agent pool status updates (this might include online status changes)
            console.log("Agent pool status update received:", data);
            break;
          case "customerTypingStart":
            chatActions.setCustomerTypingStatus(data.chatSessionId, true);
            break;
          case "customerTypingStop":
            chatActions.setCustomerTypingStatus(data.chatSessionId, false);
            break;
          case "chatEndedAck":
            chatActions.updateActiveSessionStatus(
              data.chatSessionId,
              "CLOSED_BY_AGENT"
            );
            break;
          case "appointmentBookedAck":
            chatActions.updateActiveSession(data.chatSessionId, {
              // appointmentBooked: true,
              // appointmentData: data.appointment,
            });
            chatActions.setAppointmentBookingInProgress(
              data.chatSessionId,
              false
            );
            break;
          case "visitorActivity":
            // Handle visitor activity events
            visitorActions.handleVisitorActivity(data as VisitorActivityEvent);
            break;
          case "chatSessionRestored":
            // Handle chat session restoration - add the session to active sessions
            chatActions.addActiveSession(data);
            break;
          case "agentDisconnectedFromChat":
            // Handle agent disconnection - update session status to PENDING_AGENT_RECONNECT
            chatActions.updateActiveSessionStatus(
              data.chatSessionId,
              "PENDING_AGENT_RECONNECT"
            );
            break;
          case "agentReconnectedToChat":
            // Handle agent reconnection - update session status to ACTIVE
            chatActions.updateActiveSessionStatus(
              data.chatSessionId,
              "ACTIVE"
            );
            break;
          case "customerDisconnectedFromChat":
            // Handle customer disconnection - could show a notification or update UI
            console.log(`Customer ${data.customerName} disconnected from chat ${data.chatSessionId}`);
            break;
          case "customerReconnectedToChat":
            // Handle customer reconnection - could show a notification or update UI
            console.log(`Customer ${data.customerName} reconnected to chat ${data.chatSessionId}`);
            break;
        }
      });

      // No cleanup function - we want the socket to persist globally
      return () => {
        // Only remove the listener, not the socket connection
        removeListener();
      };
    }
  }, [accessToken, user, chatActions, authActions, visitorActions, activeSessions, showMessageNotification, showChatRequestNotification, showMessageToast, showChatRequestToast]);

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

  const endChat = useCallback((chatSessionId: string) => {
    console.log("endChat", chatSessionId);
    return socketService.endChat(chatSessionId);
  }, []);

  const bookCustomer = useCallback(
    (payload: { chatSessionId: string; date: string; notes?: string }) => {
      return socketService.bookCustomer(payload);
    },
    []
  );

  return {
    sendMessage,
    acceptChat,
    setOnlineStatus,
    sendTypingStart,
    sendTypingStop,
    endChat,
    bookCustomer,
    isConnected: socketService.isConnected,
    socket: socketService.instance,
  };
}

// Global component for socket initialization
export function GlobalSocketInitializer() {
  useSocketInitializer();
  return null;
}
