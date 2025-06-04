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
    removeActiveSession: (sessionId: string) => void; // e.g., when chat ends/resolved

    setSelectedSessionId: (sessionId: string | null) => void;

    addMessageToSession: (sessionId: string, message: ChatMessage) => void;
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

    addPendingRequest: (session: ChatSession) => void;
    removePendingRequest: (sessionId: string) => void;

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
    addPendingRequest: (session) =>
      set((state) => ({
        pendingRequests: [
          ...state.pendingRequests.filter((s) => s._id !== session._id),
          session,
        ],
      })),
    removePendingRequest: (sessionId) =>
      set((state) => ({
        pendingRequests: state.pendingRequests.filter(
          (s) => s._id !== sessionId
        ),
      })),
    // clearChatState: () => set(initialState),
  },
}));

// Selectors
export const useSocketInstance = () => useChatStore((state) => state.socket);
export const useIsSocketConnected = () =>
  useChatStore((state) => state.isConnected);
export const useActiveChatSessions = () =>
  useChatStore((state) => state.activeSessions);
export const usePendingChatRequests = () =>
  useChatStore((state) => state.pendingRequests);
export const useSelectedChatSessionId = () =>
  useChatStore((state) => state.selectedSessionId);
export const useChatActions = () => useChatStore((state) => state.actions);
