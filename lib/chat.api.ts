// src/lib/api-chat.ts
import { useQuery, UseQueryOptions, QueryKey } from "@tanstack/react-query"; // Removed useInfiniteQuery
import { customFetch } from "./api";
import {
  ChatSession,
  ChatMessage,
  GetChatSessionsQueryDto,
  // GetMessagesQueryDto, // We might not need explicit GetMessagesQueryDto if fetching all
  // PaginatedResponse, // Assuming direct array responses for now
  ApiErrorResponse,
} from "@/types";
import { useCurrentUser } from "@/stores/auth";

// 1. Get All Chat Sessions (Admin / Filtered for Agent History) - Now fetches all
export const CHAT_SESSIONS_QUERY_KEY_PREFIX = "chatSessions";

export const useGetAllChatSessions = (
  params: Omit<GetChatSessionsQueryDto, "limit" | "page"> = {}, // Omitting limit and page
  options?: Omit<
    UseQueryOptions<
      ChatSession[], // Expecting a direct array
      ApiErrorResponse,
      ChatSession[],
      [
        string,
        Omit<GetChatSessionsQueryDto, "limit" | "page" | "forCurrentAgent">
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
  const { forCurrentAgent, ...apiParams } = stableParams;

  return useQuery<
    ChatSession[],
    ApiErrorResponse,
    ChatSession[],
    [string, typeof apiParams]
  >({
    queryKey: [CHAT_SESSIONS_QUERY_KEY_PREFIX, apiParams],
    queryFn: () => {
      const queryParams = new URLSearchParams();
      // Do NOT append limit or page
      if (apiParams.status) queryParams.append("status", apiParams.status);
      if (apiParams.agentId) queryParams.append("agentId", apiParams.agentId);
      if (apiParams.departmentId)
        queryParams.append("departmentId", apiParams.departmentId);
      if (apiParams.customerName)
        queryParams.append("customerName", apiParams.customerName);
      if (apiParams.customerEmail)
        queryParams.append("customerEmail", apiParams.customerEmail);
      const queryString = queryParams.toString();

      // Assuming the API returns ChatSession[] if no pagination params are sent
      return customFetch<ChatSession[]>(
        `/chat/sessions${queryString ? `?${queryString}` : ""}`
      );
    },
    ...options,
  });
};

// 2. Get Agent's Active Chat Sessions - Unchanged as it was already non-paginated
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

// 3. Get Messages for a Chat Session - Now fetches all
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
