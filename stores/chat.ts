// src/store/chat.ts
import { create } from "zustand";
import { Socket } from "socket.io-client"; // We'll install this
import { ChatSession, ChatMessage, ChatSessionStatus } from "@/types";

// Define more specific types for store state if needed
interface ActiveChat extends ChatSession {
  messages: ChatMessage[];
  hasUnread: boolean;
  isLoadingMessages: boolean;
  hasMoreMessages: boolean;
  typing?: { customer?: boolean; agent?: boolean };
}

interface ChatState {
  socket: Socket | null;
  isConnected: boolean;
  activeSessions: Record<string, ActiveChat>; // Keyed by session ID for quick access
  pendingRequests: ChatSession[]; // For agents to see incoming chats
  selectedSessionId: string | null; // ID of the currently viewed chat in "My Chats"
  bookingInProgress: string[]; // Array of session IDs that are currently booking appointments

  actions: {
    setSocket: (socket: Socket | null) => void;
    setConnected: (isConnected: boolean) => void;

    // For "My Chats" (Agent/Admin)
    loadActiveSessions: (sessions: ChatSession[]) => void;
    addActiveSession: (session: ChatSession) => void; // e.g., when a chat is accepted
    updateActiveSessionStatus: (
      sessionId: string,
      status: ChatSessionStatus,
      updates?: Partial<ChatSession>
    ) => void;
    updateActiveSession: (
      sessionId: string,
      updates: Partial<ChatSession>
    ) => void; // For general updates to a session
    removeActiveSession: (sessionId: string) => void; // e.g., when chat ends/resolved

    setSelectedSessionId: (sessionId: string | null) => void;

    addMessageToSession: (sessionId: string, message: ChatMessage) => void;
    setUnreadCount: (sessionId: string, unreadCount: number) => void;
    loadMessagesForSession: (
      sessionId: string,
      messages: ChatMessage[]
    ) => void;
    setMessagesLoading: (sessionId: string, isLoading: boolean) => void;

    setTypingIndicator: (
      sessionId: string,
      userType: "customer" | "agent",
      isTyping: boolean
    ) => void;

    // Convenience methods for typing indicators
    setCustomerTypingStatus: (sessionId: string, isTyping: boolean) => void;
    setAgentTypingStatus: (sessionId: string, isTyping: boolean) => void;

    // Appointment booking states
    setAppointmentBookingInProgress: (
      sessionId: string,
      inProgress: boolean
    ) => void;

    loadPendingRequests: (sessions: ChatSession[]) => void;
    addPendingRequest: (session: ChatSession) => void;
    updatePendingRequest: (
      sessionId: string,
      updates: Partial<ChatSession>
    ) => void;
    removePendingRequest: (sessionId: string) => void;

    // Message read status
    markMessagesAsSeenByAgent: (sessionId: string, timestamp: string) => void;
    markMessagesAsSeenByCustomer: (
      sessionId: string,
      timestamp: string
    ) => void;

    // TODO: Add more actions for sending messages, accepting chats via WebSocket
    // clearChatState: () => void; // For logout or re-initialization
  };
}

const initialState = {
  socket: null,
  isConnected: false,
  activeSessions: {},
  pendingRequests: [],
  selectedSessionId: null,
  bookingInProgress: [],
};

export const useChatStore = create<ChatState>((set, get) => ({
  ...initialState,
  actions: {
    setSocket: (socket) =>
      set((state) => {
        // Only update if the socket is actually different to prevent unnecessary re-renders
        if (state.socket === socket) return state;
        return { socket };
      }),
    setConnected: (isConnected) => set({ isConnected }),

    loadActiveSessions: (sessions) => {
      const newActiveSessions: Record<string, ActiveChat> = {};
      sessions.forEach((session) => {
        newActiveSessions[session._id] = {
          ...session,
          messages: [],
          hasUnread: false, // Determine this based on lastReadTimestamp vs lastMessageTimestamp
          isLoadingMessages: false,
          hasMoreMessages: true, // Assume has more initially
        };
      });
      set({ activeSessions: newActiveSessions });
    },
    addActiveSession: (session) =>
      set((state) => ({
        activeSessions: {
          ...state.activeSessions,
          [session._id]: {
            ...session,
            messages: [],
            hasUnread: true,
            isLoadingMessages: false,
            hasMoreMessages: true,
          },
        },
      })),
    updateActiveSessionStatus: (sessionId, status, updates) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state;
        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              status,
              ...updates,
            },
          },
        };
      }),
    updateActiveSession: (sessionId, updates) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state;
        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              ...updates,
            },
          },
        };
      }),
    removeActiveSession: (sessionId) =>
      set((state) => {
        const { [sessionId]: _, ...remainingSessions } = state.activeSessions;
        return {
          activeSessions: remainingSessions,
          selectedSessionId:
            state.selectedSessionId === sessionId
              ? null
              : state.selectedSessionId,
        };
      }),
    setSelectedSessionId: (sessionId) => set({ selectedSessionId: sessionId }),

    addMessageToSession: (sessionId, message) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state; // Or handle differently
        // Add to messages, ensure sorted, update lastMessagePreview, unread status etc.
        const existingMessages = state.activeSessions[sessionId].messages || [];
        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              messages: [...existingMessages, message].sort(
                (a, b) =>
                  new Date(a.timestamp).getTime() -
                  new Date(b.timestamp).getTime()
              ),
              lastMessageTimestamp: message.timestamp,
              // TODO: Update unread status if this session is not selectedSessionId
              hasUnread: true,
              // If the message payload includes unreadCount, trust it; otherwise increment
              unreadCount:
                typeof message.unreadCount === "number"
                  ? message.unreadCount
                  : (state.activeSessions[sessionId].unreadCount || 0) +
                    (message.senderType === "CUSTOMER" ? 1 : 0),
            },
          },
        };
      }),
    setUnreadCount: (sessionId, unreadCount) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state;
        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              unreadCount,
              hasUnread: (unreadCount || 0) > 0,
            },
          },
        };
      }),
    loadMessagesForSession: (
      sessionId: string,
      messages: ChatMessage[] /* removed hasMore */
    ) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state;
        const existingMessages = state.activeSessions[sessionId].messages || [];
        const uniqueMessages = [...messages, ...existingMessages]
          .filter(
            (msg, index, self) =>
              index === self.findIndex((m) => m._id === msg._id)
          )
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              messages: uniqueMessages,
              // hasMoreMessages: hasMore, // REMOVE
              isLoadingMessages: false,
              hasUnread: true,
            },
          },
        };
      }),
    setMessagesLoading: (sessionId, isLoading) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state;
        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              isLoadingMessages: isLoading,
              hasUnread: true,
            },
          },
        };
      }),
    setTypingIndicator: (sessionId, userType, isTyping) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state;
        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              typing: {
                ...state.activeSessions[sessionId].typing,
                [userType]: isTyping,
              },
            },
          },
        };
      }),
    loadPendingRequests: (sessions) => set({ pendingRequests: sessions }),
    addPendingRequest: (session) =>
      set((state) => ({
        pendingRequests: [
          ...state.pendingRequests.filter((s) => s._id !== session._id),
          session,
        ],
      })),
    updatePendingRequest: (sessionId, updates) =>
      set((state) => {
        const existingIndex = state.pendingRequests.findIndex(
          (session) => session._id === sessionId
        );

        if (existingIndex !== -1) {
          // Update existing session
          const updatedRequests = [...state.pendingRequests];
          updatedRequests[existingIndex] = {
            ...updatedRequests[existingIndex],
            ...updates,
          };
          return { pendingRequests: updatedRequests };
        } else {
          // Add new session if it doesn't exist
          // Assuming 'updates' contains the full session data when adding new
          return {
            pendingRequests: [...state.pendingRequests, updates as ChatSession],
          };
        }
      }),
    removePendingRequest: (sessionId) =>
      set((state) => ({
        pendingRequests: state.pendingRequests.filter(
          (s) => s._id !== sessionId
        ),
      })),

    // Convenience methods for typing indicators
    setCustomerTypingStatus: (sessionId, isTyping) => {
      const { setTypingIndicator } = get().actions;
      setTypingIndicator(sessionId, "customer", isTyping);
    },

    setAgentTypingStatus: (sessionId, isTyping) => {
      const { setTypingIndicator } = get().actions;
      setTypingIndicator(sessionId, "agent", isTyping);
    },

    setAppointmentBookingInProgress: (sessionId, inProgress) =>
      set((state) => {
        if (inProgress) {
          // Add the sessionId to the bookingInProgress array if not already there
          if (!state.bookingInProgress.includes(sessionId)) {
            return {
              bookingInProgress: [...state.bookingInProgress, sessionId],
            };
          }
        } else {
          // Remove the sessionId from the bookingInProgress array
          return {
            bookingInProgress: state.bookingInProgress.filter(
              (id) => id !== sessionId
            ),
          };
        }
        return state; // No change needed
      }),

    markMessagesAsSeenByAgent: (sessionId, timestamp) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state;

        const timestampMs = new Date(timestamp).getTime();

        // Mark all messages before the timestamp as read by agent
        const updatedMessages = state.activeSessions[sessionId].messages.map(
          (message) => {
            const messageTimestampMs = new Date(message.timestamp).getTime();
            if (messageTimestampMs <= timestampMs) {
              return { ...message, readByAgent: true };
            }
            return message;
          }
        );

        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              messages: updatedMessages,
            },
          },
        };
      }),

    markMessagesAsSeenByCustomer: (sessionId, timestamp) =>
      set((state) => {
        if (!state.activeSessions[sessionId]) return state;

        const timestampMs = new Date(timestamp).getTime();

        // Mark all messages before the timestamp as read by customer
        const updatedMessages = state.activeSessions[sessionId].messages.map(
          (message) => {
            const messageTimestampMs = new Date(message.timestamp).getTime();
            if (messageTimestampMs <= timestampMs) {
              return { ...message, readByCustomer: true };
            }
            return message;
          }
        );

        return {
          activeSessions: {
            ...state.activeSessions,
            [sessionId]: {
              ...state.activeSessions[sessionId],
              messages: updatedMessages,
            },
          },
        };
      }),

    // clearChatState: () => set(initialState),
  },
}));

// Selectors
export const useSocketInstance = () => useChatStore((state) => state.socket);
export const useIsSocketConnected = () =>
  useChatStore((state) => state.isConnected);
export const useSocketConnectionStatus = () =>
  useChatStore((state) => ({
    socket: state.socket,
    isConnected: state.isConnected,
    isSocketConnected: state.socket?.connected ?? false,
  }));
export const useActiveChatSessions = () =>
  useChatStore((state) => state.activeSessions);
export const usePendingChatRequests = () =>
  useChatStore((state) => state.pendingRequests);
export const useSelectedChatSessionId = () =>
  useChatStore((state) => state.selectedSessionId);
// Memoize actions selector to prevent unnecessary re-renders
export const useChatActions = () => useChatStore((state) => state.actions);
export const useIsBookingInProgress = (sessionId: string) =>
  useChatStore((state) => state.bookingInProgress.includes(sessionId));
