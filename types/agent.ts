// src/types/agent.ts
import { User } from "./index";

export interface AgentProfile {
  _id: string;
  userId: string;
  departmentIds: string[];
  domainAccess: string[];
  isOnline: boolean;
  maxConcurrentChats: number;
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
}

export interface UpdateMyAgentProfileDto {
  maxConcurrentChats?: number;
  password?: string;
}

export interface SetOnlineStatusDto {
  isOnline: boolean;
}
