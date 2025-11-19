import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { customFetch } from "./api";
import {
  GetAnalyticsResponse,
  GetAnalyticsQueryDto,
  ApiErrorResponse,
} from "@/types";

export const ANALYTICS_QUERY_KEY = "analytics";

export const useGetAnalytics = (
  params: GetAnalyticsQueryDto = {},
  options?: Omit<
    UseQueryOptions<
      GetAnalyticsResponse,
      ApiErrorResponse,
      GetAnalyticsResponse,
      [string, GetAnalyticsQueryDto]
    >,
    "queryKey" | "queryFn"
  >
) => {
  const queryParams = new URLSearchParams();

  if (params.startDate) queryParams.append("startDate", params.startDate);
  if (params.endDate) queryParams.append("endDate", params.endDate);
  if (params.source) queryParams.append("source", params.source);
  if (params.domain) queryParams.append("domain", params.domain);
  if (params.type) queryParams.append("type", params.type);
  if (params.groupBy) queryParams.append("groupBy", params.groupBy);
  if (params.agentId) queryParams.append("agentId", params.agentId);
  if (params.conversionOnly !== undefined)
    queryParams.append("conversionOnly", String(params.conversionOnly));
  if (params.includeDetails !== undefined)
    queryParams.append("includeDetails", String(params.includeDetails));
  if (params.page) queryParams.append("page", String(params.page));
  if (params.limit) queryParams.append("limit", String(params.limit));
  if (params.sortBy) queryParams.append("sortBy", params.sortBy);
  if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

  const queryString = queryParams.toString();
  const url = `/api/analytics/attribution${
    queryString ? `?${queryString}` : ""
  }`;

  return useQuery<
    GetAnalyticsResponse,
    ApiErrorResponse,
    GetAnalyticsResponse,
    [string, GetAnalyticsQueryDto]
  >({
    queryKey: [ANALYTICS_QUERY_KEY, params],
    queryFn: () => customFetch<GetAnalyticsResponse>(url),
    ...options,
  });
};
