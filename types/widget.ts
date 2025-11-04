export interface CreateWidgetDto {
  name: string;
  domains?: string[];
  departmentIds?: string[]; // Array of Department ObjectIds
  isEnabled?: boolean;
  primaryColor?: string;
  secondaryColor?: string;
  welcomeMessage?: string;
  headerText?: string;
  // Theme configuration
  theme?: WidgetTheme;
  // Additional fields expected by backend (snake_case)
  offline_text?: string;
  notification_emails?: string[];
  button_location?: ButtonLocation;
  button_label?: string;
  widget_text_color?: string;
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
  secondaryColor?: string;
  welcomeMessage: string;
  headerText: string;
  theme?: WidgetTheme;
  offline_text?: string;
  notification_emails?: string[];
  button_location?: ButtonLocation;
  button_label?: string;
  widget_text_color?: string;
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
    secondaryColor?: string;
    welcomeMessage: string;
    headerText: string;
  };
  socketUrl: string;
  socketNamespace: string;
}

// New: theme and button location types
export type ButtonLocation =
  | "top_left"
  | "top_right"
  | "bottom_left"
  | "bottom_right"
  | "center_left"
  | "center_right";

export interface WidgetTheme {
  name: "Light blue" | "Sharp blue" | "Custom";
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  textColor?: string;
  backgroundColor?: string;
}
