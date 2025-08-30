// src/lib/canned.api.ts
import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { customFetch } from "./api";
import { 
  ApiErrorResponse, 
  CannedMessage, 
  CreateCannedMessageDto, 
  UpdateCannedMessageDto, 
  CannedMessageFilters, 
  PaginatedCannedMessageResponse 
} from "@/types";

// Query key constants
export const CANNED_MESSAGES_QUERY_KEY = "canned-messages";

// 1. Create Canned Message
export const useCreateCannedMessageMutation = (
  options?: UseMutationOptions<CannedMessage, ApiErrorResponse, CreateCannedMessageDto>
) => {
  return useMutation<CannedMessage, ApiErrorResponse, CreateCannedMessageDto>({
    mutationFn: (messageData) =>
      customFetch<CannedMessage>("/agents/canned-messages", {
        method: "POST",
        body: JSON.stringify(messageData),
      }),
    ...options,
  });
};

// 2. Get Canned Messages with Pagination & Filtering
export const useGetCannedMessages = (
  filters?: CannedMessageFilters,
  options?: Omit<
    UseQueryOptions<PaginatedCannedMessageResponse, ApiErrorResponse, PaginatedCannedMessageResponse, [string, CannedMessageFilters | undefined]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<PaginatedCannedMessageResponse, ApiErrorResponse, PaginatedCannedMessageResponse, [string, CannedMessageFilters | undefined]>({
    queryKey: [CANNED_MESSAGES_QUERY_KEY, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.tags) params.append("tags", filters.tags);
      if (filters?.departmentIds) params.append("departmentIds", filters.departmentIds);
      if (filters?.isGlobal !== undefined) params.append("isGlobal", filters.isGlobal.toString());
      if (filters?.myMessages !== undefined) params.append("myMessages", filters.myMessages.toString());
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      
      const queryString = params.toString();
      const url = queryString ? `/agents/canned-messages?${queryString}` : "/agents/canned-messages";
      
      return customFetch<PaginatedCannedMessageResponse>(url);
    },
    ...options,
  });
};

// 3. Get Canned Message by ID
export const useGetCannedMessageById = (
  messageId: string | null,
  options?: Omit<
    UseQueryOptions<CannedMessage, ApiErrorResponse, CannedMessage, [string, string | null]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<CannedMessage, ApiErrorResponse, CannedMessage, [string, string | null]>({
    queryKey: [CANNED_MESSAGES_QUERY_KEY, messageId],
    queryFn: () => {
      if (!messageId) throw new Error("Message ID is required");
      return customFetch<CannedMessage>(`/agents/canned-messages/${messageId}`);
    },
    enabled: !!messageId,
    ...options,
  });
};

// 4. Update Canned Message
export const useUpdateCannedMessageMutation = (
  options?: UseMutationOptions<
    CannedMessage,
    ApiErrorResponse,
    { id: string; data: UpdateCannedMessageDto }
  >
) => {
  return useMutation<
    CannedMessage,
    ApiErrorResponse,
    { id: string; data: UpdateCannedMessageDto }
  >({
    mutationFn: ({ id, data }) =>
      customFetch<CannedMessage>(`/agents/canned-messages/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// 5. Delete Canned Message
export const useDeleteCannedMessageMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, string>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, string>({
    mutationFn: (messageId) =>
      customFetch<{ message: string }>(`/agents/canned-messages/${messageId}`, {
        method: "DELETE",
      }),
    ...options,
  });
};
