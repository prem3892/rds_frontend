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

// Custom fetch wrapper
export const customFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = useAuthStore.getState().accessToken; // Get token directly from Zustand store

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

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

    // Specific handling for 401 Unauthorized (e.g., token expired) on non-login routes
    if (response.status === 401 && !endpoint.includes("/auth/login")) {
      // Consider a more robust way to handle global logout, e.g., via a React context or queryClient default onError
      // useAuthStore.getState().actions.logout();
      // window.location.href = '/login'; // Can cause issues if not handled carefully
      console.error("Authentication error (401) on non-login route:", endpoint);
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
      loginAction(data.user, data.accessToken); // Update Zustand store
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

export * from "./chat.api";
export * from "./widget.api";
export * from "./department.api";
export * from "./agent.api";
