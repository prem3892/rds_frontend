export interface CreateWidgetDto {
  name: string;
  domains?: string[];
  departmentIds?: string[]; // Array of Department ObjectIds
  isEnabled?: boolean;
  primaryColor?: string;
  welcomeMessage?: string;
  headerText?: string;
}

export interface UpdateWidgetDto extends Partial<CreateWidgetDto> {}

export interface WidgetDepartmentInfo {
  _id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface Widget {
  _id: string;
  name: string;
  domains: string[];
  departmentIds: WidgetDepartmentInfo[];
  injectableScriptUrl: string;
  isEnabled: boolean;
  primaryColor: string;
  welcomeMessage: string;
  headerText: string;
  createdBy: string; // Admin User ID
  createdAt: string; // ISO 8601 Date string
  updatedAt: string; // ISO 8601 Date string
  __v: number;
}

import { PaginationMeta } from "./shared";

// Paginated response interface
export interface PaginatedWidgetResponse {
  items: Widget[];
  meta: PaginationMeta;
}

// For the public config endpoint
export interface WidgetPublicConfigDepartment {
  id: string; // Note: 'id' not '_id' as per spec
  name: string;
}

export interface WidgetPublicConfig {
  widgetId: string;
  name: string;
  departments: WidgetPublicConfigDepartment[];
  widgetConfig: {
    primaryColor: string;
    welcomeMessage: string;
    headerText: string;
  };
  socketUrl: string;
  socketNamespace: string;
}
