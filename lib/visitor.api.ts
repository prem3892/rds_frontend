// src/lib/visitor.api.ts
import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
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

// Query key constants
export const VISITORS_QUERY_KEY = "visitors";

// Sync visitors with backend
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


