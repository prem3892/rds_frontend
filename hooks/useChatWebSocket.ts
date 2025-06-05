// src/hooks/useChatWebSocket.ts
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth";
import { useChatStore, useChatActions } from "@/stores/chat"; // Keep these
import { ChatMessage, ChatSession, User } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

export function useChatWebSocket() {
  const { accessToken, user, actions: authActions } = useAuthStore();
  const chatActions = useChatActions();

  // socketRef is the primary reference to the socket instance for this hook.
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Condition to establish connection:
    // - User is authenticated (agent/admin)
    // - No active socket connection in socketRef.current
    if (
      accessToken &&
      user &&
      (user.role === "AGENT" || user.role === "ADMIN")
    ) {
      if (!socketRef.current || !socketRef.current.connected) {
        // Get the current socket from store without subscribing to changes
        const currentStoreSocket = useChatStore.getState().socket;

        // If there's a socket in the store and it's connected, use it.
        // This handles HMR or if the hook remounts but the store still has a live socket.
        if (currentStoreSocket && currentStoreSocket.connected) {
          console.log("Re-attaching to existing socket from store.");
          socketRef.current = currentStoreSocket;
          // Ensure listeners are (re)attached if necessary, or assume they persist on the socket object.
          // For simplicity, we'll rely on the socket object retaining its listeners.
          // The main thing is that socketRef.current now points to the live socket.
        } else {
          // Disconnect any existing stale ref before creating a new one
          if (socketRef.current) {
            socketRef.current.disconnect();
          }
          if (currentStoreSocket && !currentStoreSocket.connected) {
            // If store had a socket, but it wasn't connected, disconnect it too
            currentStoreSocket.disconnect();
          }

          console.log("Attempting to connect WebSocket...");
          const newSocket = io(`${SOCKET_URL}/chat`, {
            reconnectionAttempts: 5,
            reconnectionDelay: 3000,
            transports: ["websocket"],
          });
          socketRef.current = newSocket;

          // Only set in store if there isn't already a connected socket
          const latestStoreSocket = useChatStore.getState().socket;
          if (!latestStoreSocket || !latestStoreSocket.connected) {
            chatActions.setSocket(newSocket); // Set it in the store ONCE upon creation
          }

          newSocket.on("connect", () => {
            console.log("WebSocket connected:", newSocket.id);
            chatActions.setConnected(true);
            newSocket.emit("agent:authenticate", { token: accessToken });
          });

          newSocket.on("disconnect", (reason) => {
            console.log("WebSocket disconnected:", reason);
            chatActions.setConnected(false);
            // Optionally clear socket from store if it's this instance
            if (socketRef.current === newSocket) {
              // Or storeSocket === newSocket
              // chatActions.setSocket(null); // Be careful here, could cause issues if another part relies on it
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

          newSocket.on(
            "server:chat_accepted_by_you",
            (session: ChatSession) => {
              console.log("Chat accepted by you:", session);
              chatActions.removePendingRequest(session._id);
              chatActions.addActiveSession(session);
              chatActions.setSelectedSessionId(session._id);
              //   toast({
              //     title: "Chat Accepted",
              //     description: `You have accepted the chat.`,
              //   });
            }
          );

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
        }
      }
    } else {
      // No token/user, or invalid role: disconnect if socketRef has a connection
      if (socketRef.current && socketRef.current.connected) {
        console.log(
          "Disconnecting WebSocket due to missing token/user or invalid role."
        );
        socketRef.current.disconnect();
        // We might also want to clear it from the store if this instance put it there
        const currentStoreSocket = useChatStore.getState().socket;
        if (currentStoreSocket === socketRef.current) {
          chatActions.setSocket(null); // Clear from store
        }
        chatActions.setConnected(false);
      }
      socketRef.current = null; // Clear the ref
    }

    // Cleanup function: This runs when the component unmounts OR before the effect runs again
    // if dependencies change.
    return () => {
      // Do NOT disconnect here unconditionally if GlobalChatWebSocketInitializer is used,
      // as it might be a global socket meant to live longer than a single component.
      // The disconnect logic should primarily be based on auth status or explicit logout.
      // If this hook *is* the sole manager and unmounts, then disconnect.
      // For now, the disconnect is handled by the auth condition above.
      // Detach listeners from the specific newSocket instance if it was created in this effect run.
      // This is important if `newSocket` was indeed created inside this `useEffect`.
      // However, socketRef.current might point to an older socket reused from store.
      // A more robust listener management would involve adding/removing listeners explicitly
      // on socketRef.current rather than newSocket.
      // Example of more careful listener cleanup (if you add listeners directly to socketRef.current):
      // if (socketRef.current) {
      //   socketRef.current.off('connect');
      //   socketRef.current.off('disconnect');
      //   // ... off for all other events
      // }
      console.log("Cleaning up WebSocket listeners.");
    };
    // Dependencies:
    // - accessToken, user: To trigger connection/disconnection on auth changes.
    // - chatActions: Stable references from hooks.
    //
    // We removed `storeSocket` from the dependency array to prevent infinite loops.
    // Instead, we use useChatStore.getState().socket to get the current socket state
    // without subscribing to changes, which prevents the effect from re-running
    // when setSocket is called.
  }, [accessToken, user, chatActions, authActions]);

  // Emitter functions use socketRef.current
  const sendMessage = (payload: {
    chatSessionId: string;
    messageContent: ChatMessage["content"];
  }) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("agent:send_message", payload);
    } else {
      console.error("Socket not connected. Cannot send message.");
      //   toast({
      //     variant: "destructive",
      //     title: "Error",
      //     description: "Chat not connected. Cannot send message.",
      //   });
    }
  };

  const acceptChat = (chatSessionId: string) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("agent:accept_chat", { chatSessionId });
    } else {
      console.error("Socket not connected. Cannot accept chat.");
      //   toast({
      //     variant: "destructive",
      //     title: "Error",
      //     description: "Chat not connected. Cannot accept chat.",
      //   });
    }
  };

  const setOnlineStatus = (isOnline: boolean) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("agent:set_online_status", { isOnline });
      console.log(`User status changed to: ${isOnline ? "Online" : "Offline"}`);
    } else {
      console.error("Socket not connected. Cannot set online status.");
    }
  };

  return { sendMessage, acceptChat, setOnlineStatus };
}

// GlobalChatWebSocketInitializer remains the same
export function GlobalChatWebSocketInitializer() {
  useChatWebSocket();
  return null;
}
