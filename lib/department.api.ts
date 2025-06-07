// src/lib/api-department.ts
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { customFetch } from "./api";
import { Department, ApiErrorResponse } from "@/types"; // Ensure Department type is defined

export const DEPARTMENTS_QUERY_KEY = "departments";

export const useGetAllDepartments = (
  options?: Omit<
    UseQueryOptions<Department[], ApiErrorResponse, Department[], [string]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Department[], ApiErrorResponse, Department[], [string]>({
    queryKey: [DEPARTMENTS_QUERY_KEY],
    queryFn: () => customFetch<Department[]>("/departments"), // Adjust endpoint if needed
    ...options,
  });
};
