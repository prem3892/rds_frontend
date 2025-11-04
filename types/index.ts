// src/types/index.ts

export * from "./chat"; // Export all from chat.ts
export * from "./department"; // If you created department.ts
export * from "./widget"; // Export all from widget.ts
export * from "./agent"; // Export all from agent.ts
export * from "./visitor"; // Export all from visitor.ts
export * from "./auto-message"; // Export all from auto-message.ts
export * from "./blocked-customer"; // Export all from blocked-customer.ts
// Export all from shared.ts

export interface User {
  id: string; // Note: Login returns 'id'
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "AGENT" | "MANAGER";
  phoneNo?: string; // User's phone number
  website?: string; // User's website
  isEmailVerified?: boolean; // Email verification status
  isOnline?: boolean; // Online status from login API
  isActive?: boolean; // Adding isActive based on AdminSignupResponse
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Refresh token request/response types
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// Standard API error response structure
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[]; // Message can be an array for validation errors
  error?: string; // Optional error type string (e.g., "Bad Request")
}

// DTO for Admin Signup request
export interface AdminRegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNo?: string;
  website: string;
}

// Response type for successful Admin Signup
export interface AdminSignupSuccessResponse {
  message: string;
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: "ADMIN" | "AGENT" | "MANAGER";
    phoneNo?: string;
    website: string;
    isEmailVerified: boolean;
    tokenVersion: number;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
}
