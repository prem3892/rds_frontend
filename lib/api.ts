// src/lib/api.ts
import { useAuthStore } from "@/stores/auth";
import {
  LoginDto,
  LoginResponse,
  ApiErrorResponse,
  AdminSignupSuccessResponse,
  AdminRegisterDto,
} from "@/types";
import {
  useMutation,
  UseMutationOptions,
  QueryClient,
} from "@tanstack/react-query";
import { handleApiError, isUnauthorizedError } from "@/lib/error-handler";
import { fetchWithTokenRefresh, logoutUser } from "@/lib/token-refresh";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

if (!API_BASE_URL) {
  console.warn("NEXT_PUBLIC_API_URL is not set. API calls may fail.");
}

// Initialize QueryClient (can be here or in a dedicated react-query.ts file)
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false, // Adjust as needed
    },
    mutations: {
      retry: 0,
    },
  },
});

// Custom fetch wrapper with automatic token refresh
export const customFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetchWithTokenRefresh(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    let errorData: ApiErrorResponse;
    try {
      errorData = await response.json();
      if (typeof errorData.message === "undefined") {
        // Ensure message field exists
        errorData.message = response.statusText || "An unknown error occurred";
      }
      if (typeof errorData.statusCode === "undefined") {
        // Ensure statusCode field exists
        errorData.statusCode = response.status;
      }
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      errorData = {
        statusCode: response.status,
        message:
          response.statusText ||
          "An unexpected error occurred. The response was not valid JSON. " ,
      };
    }

    // Handle 401 errors globally (after token refresh attempt)
    if (isUnauthorizedError(errorData) && !endpoint.includes("/auth/login")) {
      // If we still get 401 after token refresh, logout the user
      await logoutUser();
    }
    throw errorData;
  }

  // Handle "204 No Content" or empty responses
  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
};

// API Hook for User Login
export const useLoginMutation = (
  options?: UseMutationOptions<LoginResponse, ApiErrorResponse, LoginDto>
) => {
  // Get the login action from the store.
  // IMPORTANT: Do not call useAuthActions() here as this file is not a React component/hook.
  // Instead, get the actions directly from the store's state.
  const loginAction = useAuthStore.getState().actions.login;

  return useMutation<LoginResponse, ApiErrorResponse, LoginDto>({
    mutationFn: (loginData: LoginDto) =>
      customFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(loginData),
      }),
    onSuccess: (data, variables, context) => {
      loginAction(data.user, data.accessToken, data.refreshToken); // Update Zustand store with refresh token
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      // Global error handling for mutations can be done here or in queryClient defaults
      console.error("Login mutation failed:", error);
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    },
    // Spread any additional options provided by the caller
    ...options,
  });
};

// API Hook for Initial Admin Signup (now AdminRegisterDto)
export const useInitialAdminSignupMutation = (
  options?: UseMutationOptions<
    AdminSignupSuccessResponse,
    ApiErrorResponse,
    AdminRegisterDto
  >
) => {
  return useMutation<
    AdminSignupSuccessResponse,
    ApiErrorResponse,
    AdminRegisterDto
  >({
    // Use the correct endpoint from the spec
    mutationFn: (signupData: AdminRegisterDto) =>
      customFetch<AdminSignupSuccessResponse>("/auth/admin/signup", {
        // Corrected endpoint
        method: "POST",
        body: JSON.stringify(signupData),
      }),
    ...options,
  });
};

// API Hook for Resend Email Verification
export const useResendVerificationMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, { email: string }>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, { email: string }>({
    mutationFn: (data: { email: string }) =>
      customFetch<{ message: string }>("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// API Hook for Email Verification
export const useEmailVerificationMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, { token: string }>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, { token: string }>({
    mutationFn: (data: { token: string }) =>
      customFetch<{ message: string }>(`/auth/verify-email?token=${data.token}`, {
        method: "GET",
      }),
    ...options,
  });
};

// API Hook for Forgot Password
export const useForgotPasswordMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, { email: string }>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, { email: string }>({
    mutationFn: (data: { email: string }) =>
      customFetch<{ message: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// API Hook for Reset Password
export const useResetPasswordMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, { token: string; newPassword: string }>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, { token: string; newPassword: string }>({
    mutationFn: (data: { token: string; newPassword: string }) =>
      customFetch<{ message: string }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// API Hook for Change Password
export interface ChangePasswordDto {
  oldPassword: string;
  newPassword: string;
}

export const useChangePasswordMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, ChangePasswordDto>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, ChangePasswordDto>({
    mutationFn: (data: ChangePasswordDto) =>
      customFetch<{ message: string }>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

export * from "./chat.api";
export * from "./widget.api";
export * from "./department.api";
export * from "./agent.api";
export * from "./contact.api";
