import {
  useMutation,
  useQuery,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { customFetch } from "./api";
import { 
  BlockedCustomer,
  BlockCustomerDto,
  UnblockCustomerDto,
  BlockedCustomerFilters,
  PaginatedBlockedCustomerResponse
} from "@/types/blocked-customer";
import { ApiErrorResponse } from "@/types";

// Query key constants
export const BLOCKED_CUSTOMERS_QUERY_KEY = "blocked-customers";

// 1. Get Blocked Customers with Pagination & Filtering
export const useGetBlockedCustomers = (
  filters?: BlockedCustomerFilters,
  options?: Omit<
    UseQueryOptions<PaginatedBlockedCustomerResponse, ApiErrorResponse, PaginatedBlockedCustomerResponse, [string, BlockedCustomerFilters | undefined]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<PaginatedBlockedCustomerResponse, ApiErrorResponse, PaginatedBlockedCustomerResponse, [string, BlockedCustomerFilters | undefined]>({
    queryKey: [BLOCKED_CUSTOMERS_QUERY_KEY, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());
      if (filters?.sortBy) params.append("sortBy", filters.sortBy);
      if (filters?.sortOrder) params.append("sortOrder", filters.sortOrder);
      
      const queryString = params.toString();
      const url = queryString ? `/block-customer?${queryString}` : "/block-customer";
      
      return customFetch<PaginatedBlockedCustomerResponse>(url);
    },
    ...options,
  });
};

// 2. Block Customer
export const useBlockCustomerMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, BlockCustomerDto>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, BlockCustomerDto>({
    mutationFn: (data) =>
      customFetch<{ message: string }>("/block-customer/block", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// 3. Unblock Customer
export const useUnblockCustomerMutation = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, UnblockCustomerDto>
) => {
  return useMutation<{ message: string }, ApiErrorResponse, UnblockCustomerDto>({
    mutationFn: (data) =>
      customFetch<{ message: string }>("/block-customer/unblock", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};
