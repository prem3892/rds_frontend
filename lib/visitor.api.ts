// src/lib/visitor.api.ts
import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  UseMutationOptions,
  UseQueryOptions,
  UseInfiniteQueryOptions,
} from "@tanstack/react-query";
import { customFetch } from "./api";
import { ApiErrorResponse } from "@/types";

// Visitor Sync DTO for requesting sync
export interface VisitorSyncRequestDto {
  forceFullSync?: boolean;
}

// API Response interfaces
export interface VisitorSyncChange {
  type: "update" | "create" | "delete";
  customerId: string;
  data: {
    customerId: string;
    name: string;
    status: "connected" | "disconnected" | "reconnected";
    lastActivity: string; // ISO date string
    metadata?: {
      source?: string;
      referrer?: string;
      [key: string]: any;
    };
    connectedAt: string; // ISO date string
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
  };
  timestamp: string; // ISO date string
}

export interface VisitorSyncResponse {
  since: string; // ISO date string
  changes: VisitorSyncChange[];
  fullSync: boolean;
  totalVisitors: number;
  hasMore: boolean;
}

// Current Visitors API interfaces (new paginated API)
export interface CurrentVisitorData {
  customerId: string;
  widgetId: string;
  domain: string;
  name: string;
  status: "connected" | "disconnected" | "reconnected";
  lastActivity: string;
  connectedAt: string;
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
    currentPageUrl?: string;
    initialDomain?: string;
    clientFingerprint?: string;
    ipInfo?: {
      clientIp?: string;
      isCloudflare?: boolean;
      proxyChain?: any[];
      timestamp?: string;
      isPrivate?: boolean;
    };
    [key: string]: any;
  };
  fingerprint?: string;
  currentPageUrl: string;
  browserInfo?: {
    userAgent?: string;
    language?: string;
    platform?: string;
    cookieEnabled?: boolean;
    screenResolution?: string;
    timezone?: string;
    timestamp?: string;
  };
  email?: string;
  phone?: string;
}

export interface CurrentVisitorsResponse {
  visitors: CurrentVisitorData[];
  totalCount: number;
  hasMore: boolean;
  nextCursor?: string;
  lastSync: string;
}

export interface CurrentVisitorsParams {
  since?: string; // ISO timestamp
  limit?: number; // 1-1000, default 10
  cursor?: string; // pagination cursor
}

// Query key constants
export const VISITORS_QUERY_KEY = "visitors";
export const CURRENT_VISITORS_QUERY_KEY = "current-visitors";

// New Current Visitors API hooks
export const useCurrentVisitors = (
  params: CurrentVisitorsParams = { limit: 10 },
  options?: UseQueryOptions<CurrentVisitorsResponse, ApiErrorResponse>
) => {
  const searchParams = new URLSearchParams();
  
  if (params.since) searchParams.set("since", params.since);
  if (params.limit) searchParams.set("limit", params.limit.toString());
  if (params.cursor) searchParams.set("cursor", params.cursor);

  const queryString = searchParams.toString();
  const url = `/api/agents/visitors/current${queryString ? `?${queryString}` : ""}`;

  return useQuery<CurrentVisitorsResponse, ApiErrorResponse>({
    queryKey: [CURRENT_VISITORS_QUERY_KEY, params],
    queryFn: () => customFetch<CurrentVisitorsResponse>(url, { method: "GET" }),
    ...options,
  });
};

export const useCurrentVisitorsInfinite = (
  params: Omit<CurrentVisitorsParams, "cursor"> = { limit: 10 },
  options?: Omit<UseInfiniteQueryOptions<
    CurrentVisitorsResponse, 
    ApiErrorResponse
  >, 'queryKey' | 'queryFn' | 'getNextPageParam' | 'initialPageParam'>
) => {
  return useInfiniteQuery({
    queryKey: [CURRENT_VISITORS_QUERY_KEY, params],
    queryFn: ({ pageParam }: any) => {
      const searchParams = new URLSearchParams();
      
      if (params.since) searchParams.set("since", params.since);
      if (params.limit) searchParams.set("limit", params.limit.toString());
      if (pageParam) searchParams.set("cursor", pageParam);

      const queryString = searchParams.toString();
      const url = `/api/agents/visitors/current${queryString ? `?${queryString}` : ""}`;

      return customFetch<CurrentVisitorsResponse>(url, { method: "GET" });
    },
    getNextPageParam: (lastPage: CurrentVisitorsResponse) => {
      return lastPage.hasMore ? lastPage.nextCursor : undefined;
    },
    initialPageParam: undefined,
    ...options,
  });
};

// Legacy Sync visitors with backend (deprecated)
export const useVisitorSyncMutation = (
  options?: UseMutationOptions<
    VisitorSyncResponse,
    ApiErrorResponse,
    VisitorSyncRequestDto
  >
) => {
  return useMutation<VisitorSyncResponse, ApiErrorResponse, VisitorSyncRequestDto>({
    mutationFn: (data: VisitorSyncRequestDto) =>
      customFetch<VisitorSyncResponse>("/api/agents/visitors/sync", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};


