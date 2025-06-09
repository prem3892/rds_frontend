// src/types/chat.ts

// From GET /chat/sessions and GET /chat/sessions/my-active
export interface ChatSession {
  _id: string;
  customerId:
    | string
    | {
        // Assuming it might be populated
        _id: string;
        firstName?: string;
        lastName?: string;
        email?: string;
      }; // Could be an object if populated with customer details
  agentId?: string | null; // Could be an object if populated
  agent?: {
    // Assuming it might be populated
    _id: string;
    firstName?: string;
    lastName?: string;
  };
  departmentId?:
    | string
    | null
    | {
        _id: string;
        name: string;
        description?: string;
        createdBy?: string;
        createdAt?: string;
        updatedAt?: string;
        __v?: number;
      };
  department?: {
    // Assuming it might be populated
    _id: string;
    name?: string;
  };
  initialMessage: string;
  status: ChatSessionStatus;
  createdAt: string; // ISO 8601 Date string
  updatedAt: string; // ISO 8601 Date string
  lastMessageTimestamp?: string | null; // ISO 8601 Date string
  lastMessagePreview?: string; // Not in spec, but useful for UI
  unreadCount?: number; // Not in spec, useful for UI
  // ... other potential session fields from ChatSessionDocument
  // e.g., initiatedBy, endedBy, resolutionNotes, rating, tags, customData, etc.
}

export type ChatSessionStatus =
  | "OPEN"
  | "PENDING_ASSIGNMENT"
  | "ACTIVE"
  | "CLOSED"
  | "ABANDONED_BY_CUSTOMER"
  | "ABANDONED_BY_AGENT"
  | "PENDING_AGENT_RECONNECT"
  | "PENDING_CUSTOMER_RECONNECT"
  | "RESOLVED";

// For GET /chat/sessions query parameters
export interface GetChatSessionsQueryDto {
  limit?: number;
  page?: number;
  status?: ChatSessionStatus;
  agentId?: string;
  departmentId?: string;
  customerName?: string;
  customerEmail?: string;
  // For "Chat History" specific to an agent
  forCurrentAgent?: boolean; // Custom client-side flag to add agentId filter
}

// For paginated responses like GET /chat/sessions and GET /chat/sessions/:sessionId/messages
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// From GET /chat/sessions/:sessionId/messages
export interface ChatMessageContent {
  text?: string;
  url?: string; // For images/files
  filename?: string;
  mimetype?: string;
  // For appointment notices or other structured content
  [key: string]: any; // Allow other properties for different message types
}

export interface ChatMessage {
  _id: string;
  chatSessionId: string;
  senderId: string; // Customer ID, Agent ID, or "SYSTEM"
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  messageType: string; // "TEXT", "IMAGE", "FILE", "APPOINTMENT_BOOKED_NOTICE", etc.
  content: ChatMessageContent;
  timestamp: string; // ISO 8601 Date string
  readByAgent?: boolean;
  readByCustomer?: boolean;
  // ... other potential message fields from ChatMessageDocument
}

// For GET /chat/sessions/:sessionId/messages query parameters
export interface GetMessagesQueryDto {
  limit?: number;
  page?: number;
}

// --- WebSocket Related DTOs (abbreviated, will expand as needed) ---
export interface SendMessageDto {
  chatSessionId: string;
  messageContent: ChatMessageContent;
}
