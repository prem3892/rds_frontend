// src/lib/auto-message.api.ts
import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { customFetch } from "./api";
import { 

        AutoMessage,
  CreateAutoMessageDto,
  UpdateAutoMessageDto,
  AutoMessageFilters,
  PaginatedAutoMessageResponse
} from "@/types/auto-message";
import { ApiErrorResponse } from "@/types";

// Query key constants
export const AUTO_MESSAGES_QUERY_KEY = "auto-messages";

// 1. Create Auto Message
export const useCreateAutoMessageMutation = (
  options?: UseMutationOptions<AutoMessage, ApiErrorResponse, CreateAutoMessageDto>
) => {
  return useMutation<AutoMessage, ApiErrorResponse, CreateAutoMessageDto>({
    mutationFn: (messageData) =>
      customFetch<AutoMessage>("/auto-messages", {
        method: "POST",
        body: JSON.stringify(messageData),
      }),
    ...options,
  });
};

// 2. Get Auto Messages with Pagination & Filtering
export const useGetAutoMessages = (
  filters?: AutoMessageFilters,
  options?: Omit<
    UseQueryOptions<PaginatedAutoMessageResponse, ApiErrorResponse, PaginatedAutoMessageResponse, [string, AutoMessageFilters | undefined]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<PaginatedAutoMessageResponse, ApiErrorResponse, PaginatedAutoMessageResponse, [string, AutoMessageFilters | undefined]>({
    queryKey: [AUTO_MESSAGES_QUERY_KEY, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.widgetId) params.append("widgetId", filters.widgetId);
      if (filters?.domain) params.append("domain", filters.domain);
      if (filters?.isEnabled !== undefined) params.append("isEnabled", filters.isEnabled.toString());
      if (filters?.sitewide !== undefined) params.append("sitewide", filters.sitewide.toString());
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      // if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      // if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      
      const queryString = params.toString();
      const url = queryString ? `/auto-messages?${queryString}` : "/auto-messages";
      
      return customFetch<PaginatedAutoMessageResponse>(url);
    },
    ...options,
  });
};

// 3. Get Auto Message by ID
export const useGetAutoMessageById = (
  messageId: string | null,
  options?: Omit<
    UseQueryOptions<AutoMessage, ApiErrorResponse, AutoMessage, [string, string | null]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<AutoMessage, ApiErrorResponse, AutoMessage, [string, string | null]>({
    queryKey: [AUTO_MESSAGES_QUERY_KEY, messageId],
    queryFn: () => {
      if (!messageId) throw new Error("Message ID is required");
      return customFetch<AutoMessage>(`/auto-messages/${messageId}`);
    },
    enabled: !!messageId,
    ...options,
  });
};

// 4. Update Auto Message
export const useUpdateAutoMessageMutation = (
  options?: UseMutationOptions<
    AutoMessage,
    ApiErrorResponse,
    { id: string; data: UpdateAutoMessageDto }
  >
) => {
  return useMutation<
    AutoMessage,
    ApiErrorResponse,
    { id: string; data: UpdateAutoMessageDto }
  >({
    mutationFn: ({ id, data }) =>
      customFetch<AutoMessage>(`/auto-messages/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// 5. Delete Auto Message
export const useDeleteAutoMessageMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, string>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, string>({
    mutationFn: (messageId) =>
      customFetch<{ message: string }>(`/auto-messages/${messageId}`, {
        method: "DELETE",
      }),
    ...options,
  });
};
