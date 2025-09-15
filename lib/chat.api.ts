// src/lib/api-chat.ts
import { useCurrentUser } from "@/stores/auth";
import {
  // GetMessagesQueryDto, // We might not need explicit GetMessagesQueryDto if fetching all
  // PaginatedResponse, // Assuming direct array responses for now
  ApiErrorResponse,
  ChatMessage,
  ChatSession,
  GetChatSessionsQueryDto,
  InitiateChatRequest,
  InitiateChatResponse,
} from "@/types";
import { useQuery, useInfiniteQuery, useMutation, UseQueryOptions, UseInfiniteQueryOptions, UseMutationOptions } from "@tanstack/react-query";
import { customFetch } from "./api";

// 1. Get All Chat Sessions (Admin / Filtered for Agent History) - Now fetches all
export const CHAT_SESSIONS_QUERY_KEY_PREFIX = "chatSessions";

// Define the response type for chat sessions
interface ChatSessionsResponse {
  items: ChatSession[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const useGetAllChatSessions = (
  params: GetChatSessionsQueryDto = {},
  options?: Omit<
    UseQueryOptions<
      ChatSessionsResponse, // API returns {items, meta}
      ApiErrorResponse,
      ChatSessionsResponse, // Return full response to access meta
      [
        string,
        GetChatSessionsQueryDto
      ]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const currentUser = useCurrentUser();
  const stableParams = { ...params };

  if (
    stableParams.forCurrentAgent &&
    currentUser &&
    (currentUser.role === "AGENT" || currentUser.role === "ADMIN")
  ) {
    stableParams.agentId = currentUser.id;
  }
  const { ...apiParams } = stableParams;

  return useQuery<
    ChatSessionsResponse,
    ApiErrorResponse,
    ChatSessionsResponse,
    [string, typeof apiParams]
  >({
    queryKey: [CHAT_SESSIONS_QUERY_KEY_PREFIX, apiParams],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      // Include limit and page for pagination
      if (apiParams.limit) queryParams.append("limit", apiParams.limit.toString());
      if (apiParams.page) queryParams.append("page", apiParams.page.toString());
      if (apiParams.status) queryParams.append("status", apiParams.status);
      if (apiParams.agentId) queryParams.append("agentId", apiParams.agentId);
      if (apiParams.departmentId)
        queryParams.append("departmentId", apiParams.departmentId);
      if (apiParams.customerName)
        queryParams.append("customerName", apiParams.customerName);
      if (apiParams.customerEmail)
        queryParams.append("customerEmail", apiParams.customerEmail);
      const queryString = queryParams.toString();
      const url = `/chat/sessions${queryString ? `?${queryString}` : ""}`;
      
      // Debug logging
      console.log('API URL:', url);
      console.log('Query params:', queryString);

      // API returns {items: ChatSession[], meta: {...}}
      return customFetch<ChatSessionsResponse>(url);
    },
    // Return full response to access both items and meta
    ...options,
  });
};

// 2. Get Agent's Active Chat Sessions
export const MY_ACTIVE_CHAT_SESSIONS_QUERY_KEY = "myActiveChatSessions";

export const useGetMyActiveChatSessions = (
  options?: Omit<
    UseQueryOptions<ChatSession[], ApiErrorResponse, ChatSession[], [string]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<ChatSession[], ApiErrorResponse, ChatSession[], [string]>({
    queryKey: [MY_ACTIVE_CHAT_SESSIONS_QUERY_KEY],
    queryFn: () => customFetch<ChatSession[]>("/chat/sessions/my-active"),
    ...options,
  });
};

// 3. Get Pending Chat Sessions
export const PENDING_CHAT_SESSIONS_QUERY_KEY = "pendingChatSessions";

export const useGetPendingChatSessions = (
  options?: Omit<
    UseQueryOptions<ChatSession[], ApiErrorResponse, ChatSession[], [string]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<ChatSession[], ApiErrorResponse, ChatSession[], [string]>({
    queryKey: [PENDING_CHAT_SESSIONS_QUERY_KEY],
    queryFn: () => customFetch<ChatSession[]>("/chat/sessions/pending"),
    ...options,
  });
};

// 4. Get Messages for a Chat Session - Now fetches all
export const CHAT_MESSAGES_QUERY_KEY_PREFIX = "chatMessages";

export const useGetChatMessages = (
  sessionId: string | null,
  // No params needed if fetching all by default
  options?: Omit<
    UseQueryOptions<
      ChatMessage[], // Expecting a direct array of all messages
      ApiErrorResponse,
      ChatMessage[],
      [string, string | null] // QueryKey: [prefix, sessionId]
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<
    ChatMessage[],
    ApiErrorResponse,
    ChatMessage[],
    [string, string | null]
  >({
    queryKey: [CHAT_MESSAGES_QUERY_KEY_PREFIX, sessionId],
    queryFn: async () => {
      if (!sessionId) {
        // To prevent error when sessionId is null initially, return empty array or let `enabled` handle it
        return [];
      }
      // Assuming the API returns ChatMessage[] if no pagination params are sent
      return customFetch<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`);
    },
    enabled: !!sessionId, // Query will only run if sessionId is truthy
    ...options,
  });
};

// 5. Infinite Query for Chat Sessions (for infinite scroll)
export const CHAT_SESSIONS_INFINITE_QUERY_KEY_PREFIX = "chatSessionsInfinite";

export const useGetAllChatSessionsInfinite = (
  params: Omit<GetChatSessionsQueryDto, "page"> = {},
  options?: Omit<
    UseInfiniteQueryOptions<
      ChatSessionsResponse,
      ApiErrorResponse,
      ChatSession[],
      [string, Omit<GetChatSessionsQueryDto, "page">],
      number
    >,
    "queryKey" | "queryFn" | "getNextPageParam" | "initialPageParam"
  >
) => {
  const currentUser = useCurrentUser();
  const stableParams = { ...params };

  if (
    stableParams.forCurrentAgent &&
    currentUser &&
    (currentUser.role === "AGENT" || currentUser.role === "ADMIN")
  ) {
    stableParams.agentId = currentUser.id;
  }
  const { ...apiParams } = stableParams;

  return useInfiniteQuery<
    ChatSessionsResponse,
    ApiErrorResponse,
    ChatSession[],
    [string, typeof apiParams],
    number
  >({
    queryKey: [CHAT_SESSIONS_INFINITE_QUERY_KEY_PREFIX, apiParams],
    queryFn: ({ pageParam = 1 }) => {
      const queryParams = new URLSearchParams();
      queryParams.append("page", pageParam.toString());
      if (apiParams.limit) queryParams.append("limit", apiParams.limit.toString());
      if (apiParams.status) queryParams.append("status", apiParams.status);
      if (apiParams.agentId) queryParams.append("agentId", apiParams.agentId);
      if (apiParams.departmentId)
        queryParams.append("departmentId", apiParams.departmentId);
      if (apiParams.customerName)
        queryParams.append("customerName", apiParams.customerName);
      if (apiParams.customerEmail)
        queryParams.append("customerEmail", apiParams.customerEmail);
      const queryString = queryParams.toString();

      return customFetch<ChatSessionsResponse>(
        `/chat/sessions${queryString ? `?${queryString}` : ""}`
      );
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.meta.hasNext ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    select: (data) => {
      // Flatten all pages into a single array
      return data.pages.flatMap(page => page.items);
    },
    ...options,
  });
};

// 6. Initiate Chat Mutation
export const useInitiateChatMutation = (
  options?: UseMutationOptions<InitiateChatResponse, ApiErrorResponse, InitiateChatRequest>
) => {
  return useMutation<InitiateChatResponse, ApiErrorResponse, InitiateChatRequest>({
    mutationFn: async (data: InitiateChatRequest) => {
      return customFetch<InitiateChatResponse>("/chat/initiate", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    ...options,
  });
};

