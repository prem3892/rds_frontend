// src/types/index.ts

export * from "./chat"; // Export all from chat.ts
export * from "./department"; // If you created department.ts
export * from "./widget"; // Export all from widget.ts
export * from "./agent"; // Export all from agent.ts
export * from "./visitor"; // Export all from visitor.ts
export * from "./canned-message"; // Export all from canned-message.ts

export interface User {
  id: string; // Note: Login returns 'id'
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "AGENT";
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
  user: User;
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
}

// Response type for successful Admin Signup
export interface AdminSignupSuccessResponse {
  _id: string; // Note: Admin signup returns '_id'
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
