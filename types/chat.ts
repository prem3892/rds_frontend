// src/types/chat.ts

// From GET /chat/sessions and GET /chat/sessions/my-active
export interface ChatSession {
  _id: string;
  widgetId: {
    _id: string;
    name: string;
  };
  customerId: {
    _id: string;
    email: string;
    name: string;
  };
  agentId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  departmentId: {
    _id: string;
    name: string;
  };
  status: ChatSessionStatus;
  initiatedAt: string; // ISO 8601 Date string
  acceptedAt: string; // ISO 8601 Date string
  endedAt: string | null; // ISO 8601 Date string
  lastMessageAt: string; // ISO 8601 Date string
  customerLastSeen: string; // ISO 8601 Date string
  initialMessage: string;
  domain: string;
  priorityNotificationSentCount: number;
  createdAt: string; // ISO 8601 Date string
  updatedAt: string; // ISO 8601 Date string
  agentLastSeen: string; // ISO 8601 Date string
}

export type ChatSessionStatus =
  | "PENDING_ASSIGNMENT"
  | "ACTIVE"
  | "RESOLVED"
  | "CLOSED_BY_AGENT"
  | "CLOSED_BY_CUSTOMER"
  | "ABANDONED_BY_CUSTOMER"
  | "PENDING_AGENT_RECONNECT"
  | "ABANDONED_BY_AGENT"
  | "EXPIRED_PENDING_ASSIGNMENT"
  | "OFFLINE_MESSAGE";

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
  readByCustomer: boolean;
  readByAgent: boolean;
  chatSessionId: string;
  senderId: string; // Customer ID, Agent ID, or "SYSTEM"
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  content: ChatMessageContent;
  timestamp: string; // ISO 8601 Date string
  createdAt: string; // ISO 8601 Date string
  updatedAt: string; // ISO 8601 Date string
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
