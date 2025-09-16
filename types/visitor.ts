// types/visitor.ts
import { CurrentVisitorData } from "@/lib/visitor.api";

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
  socketId?: string; // Add socket ID for API sync compatibility
  widgetId?: string; // Add widget ID for API sync compatibility
}

export enum VisitorStatus {
  ONLINE = "online",
  RECONNECTED = "reconnected",
  OFFLINE = "offline",
}

// Helper type for API sync data conversion
export interface ApiVisitorData {
  customerId: string;
  name: string;
  status: "connected" | "disconnected" | "reconnected";
  lastActivity: string;
  metadata?: {
    source?: string;
    referrer?: string;
    [key: string]: any;
  };
  connectedAt: string;
  socketId?: string;
  widgetId: string;
  domain: string;
  email?: string;
  phone?: string;
  fingerprint?: string;
  currentPageUrl: string;
  browserInfo?: {
    userAgent?: string;
    platform?: string;
    language?: string;
    screenResolution?: string;
    timezone?: string;
    [key: string]: any;
  };
}

// Utility function to convert legacy API data to VisitorInfo
export function convertApiDataToVisitorInfo(
  apiData: ApiVisitorData,
  defaultWidget?: VisitorInfo["widget"]
): VisitorInfo {
  // Map API status to VisitorStatus enum
  let status: VisitorStatus;
  switch (apiData.status) {
    case "connected":
      status = VisitorStatus.ONLINE;
      break;
    case "reconnected":
      status = VisitorStatus.RECONNECTED;
      break;
    case "disconnected":
      status = VisitorStatus.OFFLINE;
      break;
    default:
      status = VisitorStatus.ONLINE;
  }

  return {
    customerId: apiData.customerId,
    name: apiData.name,
    email: apiData.email,
    phone: apiData.phone,
    fingerprint: apiData.fingerprint,
    currentPageUrl: apiData.currentPageUrl,
    domain: apiData.domain,
    widget: defaultWidget || {
      id: apiData.widgetId,
      name: "Default Widget",
      departmentIds: [],
    },
    browserInfo: {
      userAgent: apiData.browserInfo?.userAgent,
      language: apiData.browserInfo?.language,
      platform: apiData.browserInfo?.platform,
      screenResolution: apiData.browserInfo?.screenResolution,
      timezone: apiData.browserInfo?.timezone,
    },
    status,
    lastActivity: new Date(apiData.lastActivity),
    connectedAt: new Date(apiData.connectedAt),
    metadata: apiData.metadata,
    socketId: apiData.socketId,
    widgetId: apiData.widgetId,
  };
}


// Utility function to convert new current visitors API data to VisitorInfo
export function convertCurrentVisitorDataToVisitorInfo(
  apiData: CurrentVisitorData,
  defaultWidget?: VisitorInfo["widget"]
): VisitorInfo {
  // Map API status to VisitorStatus enum
  let status: VisitorStatus;
  switch (apiData.status) {
    case "connected":
      status = VisitorStatus.ONLINE;
      break;
    case "reconnected":
      status = VisitorStatus.RECONNECTED;
      break;
    case "disconnected":
      status = VisitorStatus.OFFLINE;
      break;
    default:
      status = VisitorStatus.ONLINE;
  }

  return {
    customerId: apiData.customerId,
    name: apiData.name,
    email: apiData.email,
    phone: apiData.phone,
    fingerprint: apiData.fingerprint,
    currentPageUrl: apiData.currentPageUrl,
    domain: apiData.domain,
    widget: defaultWidget || {
      id: apiData.widgetId,
      name: "Default Widget",
      departmentIds: [],
    },
    browserInfo: {
      userAgent: apiData.browserInfo?.userAgent || apiData.metadata?.browserInfo?.userAgent,
      language: apiData.browserInfo?.language || apiData.metadata?.browserInfo?.language,
      platform: apiData.browserInfo?.platform || apiData.metadata?.browserInfo?.platform,
      screenResolution: apiData.browserInfo?.screenResolution || apiData.metadata?.browserInfo?.screenResolution,
      timezone: apiData.browserInfo?.timezone || apiData.metadata?.browserInfo?.timezone,
    },
    status,
    lastActivity: new Date(apiData.lastActivity),
    connectedAt: new Date(apiData.connectedAt),
    metadata: apiData.metadata,
    widgetId: apiData.widgetId,
  };
}
