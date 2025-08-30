// src/types/canned-message.ts

export interface CannedMessage {
  _id: string;
  title: string;
  content: string;
  agentId: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  adminId: string;
  isGlobal: boolean;
  departmentIds: Array<{
    _id: string;
    name: string;
  }>;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface CreateCannedMessageDto {
  title: string;
  content: string;
  isGlobal?: boolean;
  departmentIds?: string[];
  tags?: string[];
}

export interface UpdateCannedMessageDto {
  title?: string;
  content?: string;
  isGlobal?: boolean;
  departmentIds?: string[];
  tags?: string[];
}

export interface CannedMessageFilters {
  search?: string;
  tags?: string;
  departmentIds?: string;
  isGlobal?: boolean;
  myMessages?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Pagination metadata interface (same as widget)
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Paginated response interface
export interface PaginatedCannedMessageResponse {
  items: CannedMessage[];
  meta: PaginationMeta;
}

// Legacy response interface for backward compatibility
export interface CannedMessageResponse {
  data: CannedMessage[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
