// src/lib/agent.api.ts
import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { customFetch } from "./api";
import { ApiErrorResponse, User } from "@/types";
import { AgentShift } from "@/types/agent";
import { useAuthStore } from "@/stores/auth";

// Register DTO for creating agents
export interface RegisterAgentDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "AGENT";
  phoneNo?: string;
  website?: string;
  shifts?: AgentShift[];
  timezone?: string;
  profilePicture?: string;
}

// Agent types
export interface AgentProfile {
  _id: string;
  userId: string;
  departmentIds: string[];
  domainAccess: string[];
  isOnline: boolean;
  maxConcurrentChats: number;
  phoneNo?: string;
  website?: string;
  shifts?: AgentShift[];
  timezone?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface UpdateAgentProfileDto {
  departmentIds?: string[];
  domainAccess?: string[];
  isOnline?: boolean;
  maxConcurrentChats?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  phoneNo?: string;
  website?: string;
  shifts?: AgentShift[];
  timezone?: string;
  profilePicture?: string;
}

export interface UpdateMyAgentProfileDto {
  maxConcurrentChats?: number;
  password?: string;
}

export interface SetOnlineStatusDto {
  isOnline: boolean;
}

// Query key constants
export const AGENTS_QUERY_KEY = "agents";

// Fetch all agents (admin only)
export const useGetAllAgents = (
  options?: Omit<
    UseQueryOptions<AgentProfile[], ApiErrorResponse>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<AgentProfile[], ApiErrorResponse>({
    queryKey: [AGENTS_QUERY_KEY],
    queryFn: () => customFetch<AgentProfile[]>("/agents"),
    ...options,
  });
};

// Get current agent profile
export const useGetMyAgentProfile = (
  options?: UseQueryOptions<AgentProfile, ApiErrorResponse>
) => {
  return useQuery<AgentProfile, ApiErrorResponse>({
    queryKey: [AGENTS_QUERY_KEY, "me"],
    queryFn: () => customFetch<AgentProfile>("/agents/me/profile"),
    ...options,
  });
};

// Update my agent profile (for agents)
export const useUpdateMyAgentProfileMutation = (
  options?: UseMutationOptions<
    AgentProfile,
    ApiErrorResponse,
    UpdateMyAgentProfileDto
  >
) => {
  return useMutation<AgentProfile, ApiErrorResponse, UpdateMyAgentProfileDto>({
    mutationFn: (data: UpdateMyAgentProfileDto) =>
      customFetch<AgentProfile>("/agents/me/profile", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// Update any agent profile (admin only)
export const useUpdateAgentProfileMutation = (
  options?: UseMutationOptions<
    AgentProfile,
    ApiErrorResponse,
    { agentId: string; data: UpdateAgentProfileDto }
  >
) => {
  return useMutation<
    AgentProfile,
    ApiErrorResponse,
    { agentId: string; data: UpdateAgentProfileDto }
  >({
    mutationFn: ({ agentId, data }) =>
      customFetch<AgentProfile>(`/agents/${agentId}/profile`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// Set agent online status
export const useSetAgentStatusMutation = (
  options?: UseMutationOptions<
    AgentProfile,
    ApiErrorResponse,
    SetOnlineStatusDto
  >
) => {
  return useMutation<AgentProfile, ApiErrorResponse, SetOnlineStatusDto>({
    mutationFn: (data: SetOnlineStatusDto) =>
      customFetch<AgentProfile>("/agents/status", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// Register a new agent (admin only)
export const useRegisterAgentMutation = (
  options?: UseMutationOptions<User, ApiErrorResponse, RegisterAgentDto>
) => {
  return useMutation<User, ApiErrorResponse, RegisterAgentDto>({
    mutationFn: (data: RegisterAgentDto) =>
      customFetch<User>("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// Upload profile picture
export const useUploadProfilePictureMutation = (
  options?: UseMutationOptions<{ profilePictureUrl: string; message: string }, ApiErrorResponse, File>
) => {
  return useMutation<{ profilePictureUrl: string; message: string }, ApiErrorResponse, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('profilePicture', file);
      
      // Get the auth token
      const token = useAuthStore.getState().accessToken;
      
      // Make the request directly with fetch to avoid the customFetch wrapper
      // which automatically sets Content-Type: application/json
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      
      const response = await fetch(`${API_BASE_URL}/agents/profile-picture/upload`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Don't set Content-Type - let the browser set it with boundary for FormData
        },
        body: formData,
      });

      if (!response.ok) {
        let errorData: ApiErrorResponse;
        try {
          errorData = await response.json();
        } catch (error) {
          errorData = {
            statusCode: response.status,
            message: response.statusText || "Upload failed",
          };
        }
        throw errorData;
      }

      return response.json();
    },
    ...options,
  });
};
