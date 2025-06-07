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
  // Potentially other department fields if populated
}

export interface Widget {
  _id: string;
  name: string;
  domains: string[];
  // In the response, departmentIds is an array of populated department objects
  departmentIds: WidgetDepartmentInfo[];
  injectableScriptUrl: string;
  isEnabled: boolean;
  primaryColor: string;
  welcomeMessage: string;
  headerText: string;
  createdBy: string; // Admin User ID
  createdAt: string; // ISO 8601 Date string
  updatedAt: string; // ISO 8601 Date string
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
