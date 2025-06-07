// src/lib/api-widget.ts
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { customFetch } from "./api";
import {
  Widget,
  CreateWidgetDto,
  UpdateWidgetDto,
  // WidgetPublicConfig, // For public endpoints, not strictly needed for admin management now
  ApiErrorResponse,
} from "@/types";

export const WIDGETS_QUERY_KEY = "widgets";

// 1. Create Widget
export const useCreateWidgetMutation = (
  options?: UseMutationOptions<Widget, ApiErrorResponse, CreateWidgetDto>
) => {
  return useMutation<Widget, ApiErrorResponse, CreateWidgetDto>({
    mutationFn: (widgetData) =>
      customFetch<Widget>("/widgets", {
        method: "POST",
        body: JSON.stringify(widgetData),
      }),
    ...options,
  });
};

// 2. Get All Widgets
export const useGetAllWidgets = (
  options?: Omit<
    UseQueryOptions<Widget[], ApiErrorResponse, Widget[], [string]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Widget[], ApiErrorResponse, Widget[], [string]>({
    queryKey: [WIDGETS_QUERY_KEY],
    queryFn: () => customFetch<Widget[]>("/widgets"),
    ...options,
  });
};

// 3. Get Widget by ID (or config, they are similar for admin)
// Endpoint /widgets/:id is used for GET, PUT, DELETE
export const useGetWidgetById = (
  widgetId: string | null,
  options?: Omit<
    UseQueryOptions<Widget, ApiErrorResponse, Widget, [string, string | null]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Widget, ApiErrorResponse, Widget, [string, string | null]>({
    queryKey: [WIDGETS_QUERY_KEY, widgetId], // e.g., ['widgets', 'widgetId123']
    queryFn: () => {
      if (!widgetId) throw new Error("Widget ID is required"); // Should be handled by enabled
      return customFetch<Widget>(`/widgets/${widgetId}`);
    },
    enabled: !!widgetId, // Only run if widgetId is provided
    ...options,
  });
};
// Note: GET /widgets/:widgetId/config is also available. If it has a different response or purpose for admin, a separate hook can be created.
// For now, useGetWidgetById covers fetching a single widget.

// 4. Update Widget
export const useUpdateWidgetMutation = (
  options?: UseMutationOptions<
    Widget,
    ApiErrorResponse,
    { id: string; data: UpdateWidgetDto }
  >
) => {
  return useMutation<
    Widget,
    ApiErrorResponse,
    { id: string; data: UpdateWidgetDto }
  >({
    mutationFn: ({ id, data }) =>
      customFetch<Widget>(`/widgets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// 5. Delete Widget
export const useDeleteWidgetMutation = (
  options?: UseMutationOptions<Widget, ApiErrorResponse, string> // string is widgetId
) => {
  return useMutation<Widget, ApiErrorResponse, string>({
    mutationFn: (widgetId) =>
      customFetch<Widget>(`/widgets/${widgetId}`, {
        method: "DELETE",
      }),
    ...options,
  });
};

// Public endpoints (Get Widget Script, Get Widget Public Configuration) are typically not called via TanStack Query
// from the admin dashboard directly, but are good to note. The `injectableScriptUrl` is what admin would use/share.
