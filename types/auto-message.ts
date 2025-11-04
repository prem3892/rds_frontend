// src/types/auto-message.ts

export interface AutoMessage {
  _id: string;
  title: string;
  message: string;
  widgetId: string;
  domain: string;
  sitewide: boolean;
  pagePaths: string[];
  showAfterSeconds: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateAutoMessageDto {
  title: string;
  message: string;
  widgetId: string;
  domain: string;
  sitewide: boolean;
  pagePaths: string[];
  showAfterSeconds: number;
}

export interface UpdateAutoMessageDto {
  title?: string;
  message?: string;
  widgetId?: string;
  domain?: string;
  sitewide?: boolean;
  pagePaths?: string[];
  showAfterSeconds?: number;
  isEnabled?: boolean;
}

export interface AutoMessageFilters {
  widgetId?: string;
  domain?: string;
  isEnabled?: boolean;
  sitewide?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination metadata interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Paginated response interface
export interface PaginatedAutoMessageResponse {
  items: AutoMessage[];
  meta: PaginationMeta;
}
