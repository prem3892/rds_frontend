// src/types/agent.ts
import { User } from "./index";

export interface TimeSlot {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface AgentShift {
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday";
  isWorkingDay: boolean;
  timeSlots: TimeSlot[];
  isActive: boolean;
  priority: number;
  description?: string;
}

export interface AgentProfile {
  _id: string;
  userId: string;
  departmentIds: string[];
  domainAccess: string[];
  isOnline: boolean;
  maxConcurrentChats: number;
  createdAt: string;
  updatedAt: string;
  profilePicture?: string;
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
