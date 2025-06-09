// src/hooks/useChatWebSocket.ts
import { useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";
import { useChatStore, useChatActions, useSocketInstance } from "@/stores/chat";
import { ChatMessage, ChatSession, User } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

export function useChatWebSocket() {
  const { accessToken, user, actions: authActions } = useAuthStore();
  const chatActions = useChatActions();
  const socket = useSocketInstance();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Condition to establish connection:
    // - User is authenticated (agent/admin)
    // - No active socket connection
    if (
      accessToken &&
      user &&
      (user.role === "AGENT" || user.role === "ADMIN")
    ) {
      // Check if we need to create a new connection
      const currentSocket = socketRef.current;
      if (!currentSocket || !currentSocket.connected) {
        // Disconnect any existing stale socket before creating a new one
        if (currentSocket && !currentSocket.connected) {
          currentSocket.disconnect();
        }

        console.log("Attempting to connect WebSocket...");
        const newSocket = io(`${SOCKET_URL}/chat`, {
          reconnectionAttempts: 5,
          reconnectionDelay: 3000,
          transports: ["websocket"],
        });

        // Store reference and set in store
        socketRef.current = newSocket;
        chatActions.setSocket(newSocket);

        newSocket.on("connect", () => {
          console.log("WebSocket connected:", newSocket.id);
          chatActions.setConnected(true);
          newSocket.emit("agent:authenticate", { token: accessToken });
        });

        newSocket.on("disconnect", (reason) => {
          console.log("WebSocket disconnected:", reason);
          chatActions.setConnected(false);
          // Clear socket from store and ref if it's disconnected
          if (socketRef.current === newSocket) {
            socketRef.current = null;
            chatActions.setSocket(null);
          }
        });

        newSocket.on("connect_error", (err) => {
          console.error("WebSocket connection error:", err.message, err);
          // toast({
          //   variant: "destructive",
          //   title: "Chat Connection Error",
          //   description:
          //     err.message || "Could not connect to the chat server.",
          // });
        });

        // --- Handle Server Emitted Events ---
        newSocket.on(
          "server:authenticated",
          (data: { userId: string; role: string }) => {
            console.log("WebSocket authenticated:", data);
            //   toast({
            //     title: "Chat Service",
            //     description: "Successfully connected and authenticated.",
            //   });
          }
        );

        newSocket.on("server:auth_failed", (data: { message: string }) => {
          console.error("WebSocket authentication failed:", data.message);
          // toast({
          //   variant: "destructive",
          //   title: "Chat Auth Failed",
          //   description: data.message + " Disconnecting.",
          // });
          newSocket.disconnect();
        });

        newSocket.on("server:new_message", (message: ChatMessage) => {
          console.log("Received new message via WebSocket:", message);
          chatActions.addMessageToSession(message.chatSessionId, message);
        });

        newSocket.on("server:new_chat_request", (session: ChatSession) => {
          console.log("New chat request received:", session);
          chatActions.addPendingRequest(session);
          // toast({
          //   title: "New Chat Request",
          //   description: `Incoming chat from ${
          //     session.customer?.firstName || "a customer"
          //   }.`,
          // });
        });

        newSocket.on(
          "server:chat_session_update",
          (
            update: Partial<ChatSession> & {
              chatSessionId: string;
              status: ChatSession["status"];
            }
          ) => {
            console.log("Chat session update received:", update);
            if (update.chatSessionId) {
              chatActions.updateActiveSessionStatus(
                update.chatSessionId,
                update.status,
                update
              );
              if (update.status !== "PENDING_ASSIGNMENT") {
                chatActions.removePendingRequest(update.chatSessionId);
              }
            }
          }
        );

        newSocket.on("server:chat_accepted_by_you", (session: ChatSession) => {
          console.log("Chat accepted by you:", session);
          chatActions.removePendingRequest(session._id);
          chatActions.addActiveSession(session);
          chatActions.setSelectedSessionId(session._id);
          //   toast({
          //     title: "Chat Accepted",
          //     description: `You have accepted the chat.`,
          //   });
        });

        newSocket.on(
          "server:chat_taken_or_resolved",
          (data: { chatSessionId: string }) => {
            console.log(
              "Chat taken or resolved by another agent:",
              data.chatSessionId
            );
            chatActions.removePendingRequest(data.chatSessionId);
          }
        );

        newSocket.on(
          "server:online_status_updated",
          (data: { isOnline: boolean }) => {
            console.log("Online status updated by server:", data);
            // Update the auth store with the server-confirmed status
            authActions.setOnlineStatus(data.isOnline);
          }
        );

        // Customer typing indicator events
        newSocket.on(
          "server:customer_typing_start",
          (data: { chatSessionId: string }) => {
            console.log("Customer started typing:", data.chatSessionId);
            chatActions.setCustomerTypingStatus(data.chatSessionId, true);
          }
        );

        newSocket.on(
          "server:customer_typing_stop",
          (data: { chatSessionId: string }) => {
            console.log("Customer stopped typing:", data.chatSessionId);
            chatActions.setCustomerTypingStatus(data.chatSessionId, false);
          }
        );
      }
    } else {
      // No token/user, or invalid role: disconnect if socket has a connection
      const currentSocket = socketRef.current;
      if (currentSocket && currentSocket.connected) {
        console.log(
          "Disconnecting WebSocket due to missing token/user or invalid role."
        );
        currentSocket.disconnect();
        socketRef.current = null;
        chatActions.setSocket(null); // Clear from store
        chatActions.setConnected(false);
      }
    }

    // Cleanup function: This runs when the component unmounts OR before the effect runs again
    // if dependencies change.
    return () => {
      // Disconnect socket on cleanup to prevent memory leaks
      const currentSocket = socketRef.current;
      if (currentSocket && currentSocket.connected) {
        console.log("Cleaning up WebSocket effect - disconnecting socket.");
        currentSocket.disconnect();
        socketRef.current = null;
        chatActions.setSocket(null);
        chatActions.setConnected(false);
      }
    };
    // Dependencies:
    // - accessToken, user: To trigger connection/disconnection on auth changes.
    // - chatActions, authActions: Stable references from hooks.
    // Note: socket is intentionally NOT in dependencies to prevent infinite loops
  }, [accessToken, user, chatActions, authActions]);

  // Emitter functions use the store socket
  const sendMessage = useCallback(
    (payload: {
      chatSessionId: string;
      messageContent: ChatMessage["content"];
    }) => {
      if (socket && socket.connected) {
        socket.emit("agent:send_message", payload);
      } else {
        console.error("Socket not connected. Cannot send message.");
        //   toast({
        //     variant: "destructive",
        //     title: "Error",
        //     description: "Chat not connected. Cannot send message.",
        //   });
      }
    },
    [socket]
  );

  const acceptChat = useCallback(
    (chatSessionId: string) => {
      if (socket && socket.connected) {
        socket.emit("agent:accept_chat", { chatSessionId });
      } else {
        console.error("Socket not connected. Cannot accept chat.");
        //   toast({
        //     variant: "destructive",
        //     title: "Error",
        //     description: "Chat not connected. Cannot accept chat.",
        //   });
      }
    },
    [socket]
  );

  const setOnlineStatus = useCallback(
    (isOnline: boolean) => {
      if (socket && socket.connected) {
        socket.emit("agent:set_online_status", { isOnline });
        console.log(
          `User status changed to: ${isOnline ? "Online" : "Offline"}`
        );
      } else {
        console.error("Socket not connected. Cannot set online status.");
      }
    },
    [socket]
  );

  const sendTypingStart = useCallback(
    (chatSessionId: string) => {
      if (socket && socket.connected) {
        socket.emit("agent:typing_start", { chatSessionId });
        chatActions.setAgentTypingStatus(chatSessionId, true);
      } else {
        console.error("Socket not connected. Cannot send typing start.");
      }
    },
    [socket, chatActions]
  );

  const sendTypingStop = useCallback(
    (chatSessionId: string) => {
      if (socket && socket.connected) {
        socket.emit("agent:typing_stop", { chatSessionId });
        chatActions.setAgentTypingStatus(chatSessionId, false);
      } else {
        console.error("Socket not connected. Cannot send typing stop.");
      }
    },
    [socket, chatActions]
  );

  return {
    sendMessage,
    acceptChat,
    setOnlineStatus,
    sendTypingStart,
    sendTypingStop,
  };
}

// Custom hook for socket operations - can be used anywhere in the app
export function useSocketOperations() {
  const socket = useSocketInstance();

  const sendMessage = useCallback(
    (payload: {
      chatSessionId: string;
      messageContent: ChatMessage["content"];
    }) => {
      if (socket && socket.connected) {
        socket.emit("agent:send_message", payload);
      } else {
        console.error("Socket not connected. Cannot send message.");
      }
    },
    [socket]
  );

  const acceptChat = useCallback(
    (chatSessionId: string) => {
      if (socket && socket.connected) {
        socket.emit("agent:accept_chat", { chatSessionId });
      } else {
        console.error("Socket not connected. Cannot accept chat.");
      }
    },
    [socket]
  );

  const setOnlineStatus = useCallback(
    (isOnline: boolean) => {
      if (socket && socket.connected) {
        socket.emit("agent:set_online_status", { isOnline });
        console.log(
          `User status changed to: ${isOnline ? "Online" : "Offline"}`
        );
      } else {
        console.error("Socket not connected. Cannot set online status.");
      }
    },
    [socket]
  );

  const isConnected = socket?.connected ?? false;

  const sendTypingStart = useCallback(
    (chatSessionId: string) => {
      if (socket && socket.connected) {
        socket.emit("agent:typing_start", { chatSessionId });
      } else {
        console.error("Socket not connected. Cannot send typing start.");
      }
    },
    [socket]
  );

  const sendTypingStop = useCallback(
    (chatSessionId: string) => {
      if (socket && socket.connected) {
        socket.emit("agent:typing_stop", { chatSessionId });
      } else {
        console.error("Socket not connected. Cannot send typing stop.");
      }
    },
    [socket]
  );

  return {
    sendMessage,
    acceptChat,
    setOnlineStatus,
    sendTypingStart,
    sendTypingStop,
    isConnected,
    socket,
  };
}

// GlobalChatWebSocketInitializer remains the same
export function GlobalChatWebSocketInitializer() {
  useChatWebSocket();
  return null;
}
