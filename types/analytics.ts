export interface AnalyticsBreakdown {
  source: string;
  chats: number;
  appointments: number;
  conversionRate: string;
}

export interface AnalyticsSummary {
  totalChats: number;
  totalAppointments: number;
  conversionRate: string;
  breakdown: AnalyticsBreakdown[];
}

export interface AnalyticsItem {
  chatSessionId: string;
  customerId: string;
  agentId?: string;
  agentName?: string;
  source: string;
  domain: string;
  createdAt: string;
}

export interface AnalyticsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface GetAnalyticsResponse {
  summary: AnalyticsSummary;
  items: AnalyticsItem[];
  meta: AnalyticsMeta;
}

export interface GetAnalyticsQueryDto {
  startDate?: string;
  endDate?: string;
  source?: string;
  domain?: string;
  type?: "chats" | "appointments" | "both";
  groupBy?: "source" | "domain" | "date" | "agent";
  agentId?: string;
  conversionOnly?: boolean;
  includeDetails?: boolean;
  page?: number;
  limit?: number;
  sortBy?: "chats" | "appointments" | "conversionRate" | "domain" | "source";
  sortOrder?: "asc" | "desc";
}

export const SOURCES = ["gad", "meta", "chatgpt", "organic"] as const;
export type Source = (typeof SOURCES)[number];

export const TYPES = ["chats", "appointments"] as const;
export type AnalyticsType = (typeof TYPES)[number];

export const GROUP_BY_OPTIONS = ["source", "domain", "date", "agent"] as const;
export type GroupBy = (typeof GROUP_BY_OPTIONS)[number];

export const SORT_BY_OPTIONS = [
  "chats",
  "appointments",
  "conversionRate",
  "domain",
  "source",
] as const;
export type SortBy = (typeof SORT_BY_OPTIONS)[number];
