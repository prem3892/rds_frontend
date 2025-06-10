// types/visitor.ts

export interface VisitorActivityEvent {
  customerId: string;
  customerProfile: {
    name: string;
    email?: string;
    phone?: string;
    fingerprint?: string;
    metadata: Record<string, any>;
  };
  widget: {
    id: string;
    name: string;
    departmentIds: Array<{
      id: string;
      name: string;
    }>;
  };
  domain: string;
  currentPageUrl: string;
  browserInfo: Record<string, any>;
  timestamp: Date;
  eventType: VisitorEventType;
}

export enum VisitorEventType {
  CONNECT = "visitor_connected",
  DISCONNECT = "visitor_disconnected",
  RECONNECT = "visitor_reconnected",
  UPDATE = "visitor_updated",
}

export interface VisitorInfo {
  customerId: string;
  name: string;
  email?: string;
  phone?: string;
  fingerprint?: string;
  currentPageUrl: string;
  domain: string;
  widget: {
    id: string;
    name: string;
    departmentIds: Array<{
      id: string;
      name: string;
    }>;
  };
  browserInfo: {
    userAgent?: string;
    language?: string;
    platform?: string;
    screenResolution?: string;
    timezone?: string;
  };
  status: VisitorStatus;
  lastActivity: Date;
  connectedAt: Date;
  metadata?: Record<string, any>;
}

export enum VisitorStatus {
  ONLINE = "online",
  RECONNECTED = "reconnected",
  OFFLINE = "offline",
}
