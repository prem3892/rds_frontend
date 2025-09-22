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
import { isLocalStatusChangeActive } from "@/lib/status-change-tracker";
import { AGENTS_QUERY_KEY, queryClient, MY_ACTIVE_CHAT_SESSIONS_QUERY_KEY, PENDING_CHAT_SESSIONS_QUERY_KEY } from "@/lib/api";
import { customerInactivityEvents, chatEndedEvents } from "@/lib/customer-inactivity-events";

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
            // The user's online Zstatus will remain as stored in ustand
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
          case "chatAlreadyAccepted":
            // Show toast to inform the agent the chat was already accepted elsewhere
            toast.info('Chat already accepted', {
              description: `Chat is already accepted by ${data?.acceptedByAgentName || 'another agent'}`,
            });
            queryClient.invalidateQueries({ queryKey: [MY_ACTIVE_CHAT_SESSIONS_QUERY_KEY,PENDING_CHAT_SESSIONS_QUERY_KEY] });
            break;
          case "onlineStatusUpdated":
            // Handle the new payload structure with success/error cases
            if (data.success) {
              // Success case: Update the online status in the store and persist it
              authActions.setOnlineStatus(data.isOnline!);
              console.log(`Online status synchronized from server: ${data.isOnline ? "Online" : "Offline"}`);
              
              // Invalidate agent profile query now that server has confirmed the status change
              queryClient.invalidateQueries({ queryKey: [AGENTS_QUERY_KEY, "me"] });
              
              // Show appropriate toast based on whether this was a local change or from another device
              if (isLocalStatusChangeActive()) {
                // This was a local change - show success toast
                toast.success('Status updated', {
                  description: `Your status has been changed to ${data.isOnline ? 'Online' : 'Offline'}`,
                });
              } else {
                // This was from another device or admin - show info toast
                toast.info('Status updated', {
                  description: 'Your status has been changed to ' + (data.isOnline ? 'Online' : 'Offline') + ' from another device or by Admin',
                });
              }
            } else {
              // Error case: Show error message and don't update status
              console.error('Failed to update online status:', data.error);
              
              // Only show error toast if this was a local change
              // Don't show error toast for changes from other devices
              if (isLocalStatusChangeActive()) {
                toast.error('Status update failed', {
                  description: data.error || 'Failed to update online status',
                });
              }
            }
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
              appointmentBooked: true,
              appointmentData: data.appointment,
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
           toast.info('Customer disconnected from chat', {
            description: `Customer ${data.customerName} disconnected from chat ${data.chatSessionId}`,
           });
            console.log(`Customer ${data.customerName} disconnected from chat ${data.chatSessionId}`);
            break;
          case "customerReconnectedToChat":
            // Handle customer reconnection - could show a notification or update UI
            console.log(`Customer ${data.customerName} reconnected to chat ${data.chatSessionId}`);
            break;
          case "server:priority_chat_notification":
            // Handle priority chat notification - update the pending request with priority status
            console.log("Priority chat notification received:", data);
            chatActions.updatePendingRequest(data._id, data);
            // Show priority chat notification
            showChatRequestNotification(data).catch(console.error);
            showChatRequestToast(data);
            break;
          case "server:message_seen_by_agent":
            // Handle message seen by agent acknowledgment from server
            console.log("Messages seen by agent:", data);
            chatActions.markMessagesAsSeenByAgent(data.chatSessionId, data.timestamp);
            break;
          case "server:messages_read_ack":
            // Handle read acknowledgment for the agent who triggered the read
            // console.log("Messages read acknowledgment:", data);
            chatActions.markMessagesAsSeenByAgent(data.chatSessionId, data.timestamp);
            break;
          case "server:message_seen_by_customer":
            // Handle message seen by customer acknowledgment from server
            console.log("Message seen by customer:", data);
            chatActions.markMessagesAsSeenByCustomer(data.chatSessionId, data.timestamp);
            break;
          case "server:customer_inactive":
            // Handle customer inactivity notification
            console.log("Customer inactive:", data);
            
            // Remove the session from active sessions
            chatActions.removeActiveSession(data.chatSessionId);
            
            // Invalidate active chat sessions API to refresh the data
            queryClient.invalidateQueries({ queryKey: [MY_ACTIVE_CHAT_SESSIONS_QUERY_KEY] });
            
            // Show toast notification about customer inactivity
            // toast.info('Chat Session Ended', {
            //   description: data.message,
            // });
            
            // Emit global event for modal dialog
            customerInactivityEvents.emit({
              chatSessionId: data.chatSessionId,
              message: data.message,
              customerId: data.customerId,
              customerName: data.customerName,
              sessionStatus: data.sessionStatus,
            });
            break;
          case "server:chat_ended":
            // Handle chat ended notification
            console.log("Chat ended:", data);
            
            // Remove the session from active sessions
            chatActions.removeActiveSession(data.chatSessionId);
            
            // Invalidate active chat sessions API to refresh the data
            queryClient.invalidateQueries({ queryKey: [MY_ACTIVE_CHAT_SESSIONS_QUERY_KEY] });
            
            // Show toast notification about chat ending
            // toast.error('Chat Session Ended', {
            //   description: data.message,
            // });
            
            // Emit global event for modal dialog
            chatEndedEvents.emit({
              chatSessionId: data.chatSessionId,
              message: data.message,
              customerId: data.customerId,
              customerName: data.customerName,
              sessionStatus: data.sessionStatus,
            });
            break;
          case "server:customer_info_request_sent":
            // Handle customer info request acknowledgment
            console.log("Customer info request sent:", data);
            // The success feedback is already handled in the component
            // This is just for logging and potential future use
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

  const markMessagesAsRead = useCallback(
    (payload: { chatSessionId: string; messageId: string }) => {
      return socketService.markMessagesAsRead(payload);
    },
    []
  );

  const requestCustomerInfo = useCallback(
    (payload: { chatSessionId: string }) => {
      return socketService.requestCustomerInfo(payload);
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
    markMessagesAsRead,
    requestCustomerInfo,
    isConnected: socketService.isConnected,
    socket: socketService.instance,
  };
}

// Global component for socket initialization
export function GlobalSocketInitializer() {
  useSocketInitializer();
  return null;
}
