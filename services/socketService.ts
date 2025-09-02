// services/socketService.ts
import { io, Socket } from "socket.io-client";
import { ChatMessage, ChatSession } from "@/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3001";

class SocketService {
  private socket: Socket | null = null;
  private listeners: Set<(event: string, data: any) => void> = new Set();

  initialize(token: string) {
    // If already connected, don't reinitialize
    if (this.socket && this.socket.connected) return this.socket;

    // Disconnect any existing socket that might be in a bad state
    if (this.socket) this.socket.disconnect();

    console.log("Initializing global WebSocket connection");
    this.socket = io(`${SOCKET_URL}/chat`, {
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      transports: ["websocket"],
    });

    // Set up event listeners
    this.socket.on("connect", () => {
      console.log("WebSocket connected:", this.socket?.id);
      this.notifyListeners("connected", true);
      this.socket?.emit("agent:authenticate", { token });
    });

    this.socket.on("disconnect", (reason) => {
      console.log("WebSocket disconnected:", reason);
      this.notifyListeners("connected", false);
    });

    this.socket.on("connect_error", (err) => {
      console.error("WebSocket connection error:", err.message, err);
      this.notifyListeners("error", err.message);
    });

    this.socket.on(
      "server:authenticated",
      (data: { userId: string; role: string }) => {
        console.log("WebSocket authenticated:", data);
        this.notifyListeners("authenticated", data);
      }
    );

    this.socket.on("server:auth_failed", (data: { message: string }) => {
      console.error("WebSocket authentication failed:", data.message);
      this.notifyListeners("authFailed", data);
      this.socket?.disconnect();
    });

    this.socket.on("server:new_message", (message: ChatMessage) => {
      console.log("Received new message via WebSocket:", message);
      this.notifyListeners("newMessage", message);
    });

    this.socket.on("server:new_chat_request", (session: ChatSession) => {
      console.log("New chat request received:", session);
      this.notifyListeners("newChatRequest", session);
    });

    this.socket.on(
      "server:chat_session_update",
      (
        update: Partial<ChatSession> & {
          chatSessionId: string;
          status: ChatSession["status"];
        }
      ) => {
        console.log("Chat session update received:", update);
        this.notifyListeners("chatSessionUpdate", update);
      }
    );

    this.socket.on("server:chat_accepted_by_you", (session: ChatSession) => {
      console.log("Chat accepted by you:", session);
      this.notifyListeners("chatAcceptedByYou", session);
    });

    this.socket.on(
      "server:chat_taken_or_resolved",
      (data: { chatSessionId: string }) => {
        console.log(
          "Chat taken or resolved by another agent:",
          data.chatSessionId
        );
        this.notifyListeners("chatTakenOrResolved", data);
      }
    );

    this.socket.on(
      "server:online_status_updated",
      (data: { isOnline: boolean }) => {
        console.log("Online status updated by server:", data);
        this.notifyListeners("onlineStatusUpdated", data);
      }
    );

    this.socket.on(
      "server:customer_typing_start",
      (data: { chatSessionId: string }) => {
        console.log("Customer started typing:", data.chatSessionId);
        this.notifyListeners("customerTypingStart", data);
      }
    );

    this.socket.on(
      "server:customer_typing_stop",
      (data: { chatSessionId: string }) => {
        console.log("Customer stopped typing:", data.chatSessionId);
        this.notifyListeners("customerTypingStop", data);
      }
    );

    this.socket.on(
      "server:chat_ended_ack",
      (data: { chatSessionId: string }) => {
        console.log("Chat ended acknowledgment received:", data.chatSessionId);
        this.notifyListeners("chatEndedAck", data);
      }
    );

    this.socket.on(
      "server:appointment_booked_ack",
      (data: { chatSessionId: string; appointment: any }) => {
        console.log("Appointment booked acknowledgment received:", data);
        this.notifyListeners("appointmentBookedAck", data);
      }
    );

    this.socket.on("server:visitor_activity", (data: any) => {
      console.log("Visitor activity received:", data);
      this.notifyListeners("visitorActivity", data);
    });

    // Chat session restored
    this.socket.on("server:chat_session_restored", (session: ChatSession) => {
      console.log("Chat session restored:", session);
      this.notifyListeners("chatSessionRestored", session);
    });

    return this.socket;
  }

  // Socket operations
  sendMessage(payload: {
    chatSessionId: string;
    messageContent: ChatMessage["content"];
  }) {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected. Cannot send message.");
      return false;
    }
    this.socket.emit("agent:send_message", payload);
    return true;
  }

  acceptChat(chatSessionId: string) {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected. Cannot accept chat.");
      return false;
    }
    this.socket.emit("agent:accept_chat", { chatSessionId });
    return true;
  }

  setOnlineStatus(isOnline: boolean) {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected. Cannot set online status.");
      return false;
    }
    this.socket.emit("agent:set_online_status", { isOnline });
    console.log(`User status changed to: ${isOnline ? "Online" : "Offline"}`);
    return true;
  }

  sendTypingStart(chatSessionId: string) {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected. Cannot send typing start.");
      return false;
    }
    this.socket.emit("agent:typing_start", { chatSessionId });
    return true;
  }

  sendTypingStop(chatSessionId: string) {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected. Cannot send typing stop.");
      return false;
    }
    this.socket.emit("agent:typing_stop", { chatSessionId });
    return true;
  }

  endChat(chatSessionId: string) {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected. Cannot end chat.");
      return false;
    }
    this.socket.emit("agent:end_chat", { chatSessionId });
    return true;
  }

  bookCustomer(payload: {
    chatSessionId: string;
    date: string;
    notes?: string;
  }) {
    if (!this.socket || !this.socket.connected) {
      console.error("Socket not connected. Cannot book appointment.");
      return false;
    }
    console.debug("Booking appointment for chat session:", payload);
    this.socket.emit("agent:book_appointment", payload);
    return true;
  }

  // State management helpers
  addListener(callback: (event: string, data: any) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(event: string, data: any) {
    this.listeners.forEach((listener) => listener(event, data));
  }

  // Disconnect method (rarely needed - mainly for cleanup on logout)
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Getters
  get isConnected() {
    return this.socket?.connected ?? false;
  }

  get instance() {
    return this.socket;
  }
}

// Create a singleton instance
export const socketService = new SocketService();
