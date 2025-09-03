export interface BlockedCustomer {
  _id: string;
  name: string;
  email: string;
  fingerprint: string;
  widgetId: {
    _id: string;
    name: string;
  };
  isBlocked: boolean;
  blockedBy: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  blockedAt: string;
  metadata: {
    browserInfo: {
      userAgent: string;
      language: string;
      platform: string;
      cookieEnabled: boolean;
      screenResolution: string;
      timezone: string;
      timestamp: string;
    };
    currentPageUrl: string;
    initialDomain: string;
  };
  createdAt: string;
}

import { PaginationMeta } from "./shared";

export interface PaginatedBlockedCustomerResponse {
  items: BlockedCustomer[];
  meta: PaginationMeta;
}

export interface BlockedCustomerFilters {
  search?: string;
  page: number;
  limit: number;
  sortBy: "blockedAt" | "createdAt" | "name" | "email";
  sortOrder: "asc" | "desc";
  domain?: string;
  widgetName?: string;
}

export interface BlockCustomerDto {
  customerId: string;
}

export interface UnblockCustomerDto {
  customerId: string;
}
