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
    metadata?: {
      browserInfo?: {
        userAgent?: string;
        language?: string;
        platform?: string;
        cookieEnabled?: boolean;
        screenResolution?: string;
        timezone?: string;
        timestamp?: string;
      };
      ipInfo: {
        clientIp: string; // Actual client IP
        country?: string; // Country code (US, GB, etc.)
        city?: string; // City name
        cfRay?: string; // Cloudflare Ray ID
        isCloudflare: boolean; // Whether request came through Cloudflare
        proxyChain?: string[]; // Full proxy chain if available
        timestamp: Date; // When IP was captured
        isPrivate: boolean; // Whether IP is from private network
      };
      currentPageUrl?: string;
      initialDomain?: string;
    };
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
  appointmentBooked: boolean;
  appointmentData?: {
    date: string; // ISO 8601 Date string
    notes?: string;
    bookedAt: string; // ISO 8601 Date string
  };
  // Number of unread messages for the agent; provided by API and socket updates
  unreadCount?: number;
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
  hasScheduledAppointment?: boolean;
  startDate?: string;
  endDate?: string;
  // For "Chat History" specific to an agent
  forCurrentAgent?: boolean; // Custom client-side flag to add agentId filter
}

// For paginated responses like GET /chat/sessions and GET /chat/sessions/:sessionId/messages
export interface PaginatedResponse<T> {
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// From GET /chat/sessions/:sessionId/messages
export interface ChatMessageContent {
  text?: string;
  type?: string; // For customer messages
  url?: string; // For images/files
  filename?: string;
  mimetype?: string;
  fileSize?: number; // For file size in bytes
  mimeType?: string; // Alternative spelling for mime type
  // For appointment notices or other structured content
  [key: string]: any; // Allow other properties for different message types
}

export interface AgentInfo {
  fullName: string;
  profilePicture: string;
}

export interface ChatMessage {
  _id: string;
  id?: string; // Some responses include this field
  unreadCount?: number;
  readByCustomer: boolean;
  readByAgent: boolean;
  chatSessionId: string;
  senderId: string; // Customer ID, Agent ID, or "SYSTEM"
  senderType: "CUSTOMER" | "AGENT" | "SYSTEM";
  messageType: "TEXT" | "IMAGE" | "FILE"; // New field from API response
  content: ChatMessageContent;
  timestamp: string; // ISO 8601 Date string
  createdAt?: string; // ISO 8601 Date string
  updatedAt: string; // ISO 8601 Date string
  __v?: number; // MongoDB version field
  agentInfo?: AgentInfo; // New field for agent messages
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

// --- Chat Initiate API Types ---
export interface InitiateChatRequest {
  customerId: string;
}

export interface InitiateChatResponse {
  chatSessionId: string;
  status: "ACTIVE";
  customer: {
    id: string;
    name: string;
  };
  widget: {
    id: string;
    name: string;
    welcomeMessage: string;
  };
  createdAt: string;
  message: string;
}
