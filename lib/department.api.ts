// src/lib/department.api.ts
import {
  useQuery,
  useMutation,
  UseQueryOptions,
  UseMutationOptions,
} from "@tanstack/react-query";
import { customFetch } from "./api";
import {
  Department,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  ApiErrorResponse,
} from "@/types";

export const DEPARTMENTS_QUERY_KEY = "departments";

// 1. Create Department
export const useCreateDepartmentMutation = (
  options?: UseMutationOptions<
    Department,
    ApiErrorResponse,
    CreateDepartmentDto
  >
) => {
  return useMutation<Department, ApiErrorResponse, CreateDepartmentDto>({
    mutationFn: (departmentData) =>
      customFetch<Department>("/departments", {
        method: "POST",
        body: JSON.stringify(departmentData),
      }),
    ...options,
  });
};

// 2. Get All Departments
export const useGetAllDepartments = (
  options?: Omit<
    UseQueryOptions<Department[], ApiErrorResponse, Department[], [string]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Department[], ApiErrorResponse, Department[], [string]>({
    queryKey: [DEPARTMENTS_QUERY_KEY],
    queryFn: () => customFetch<Department[]>("/departments"),
    ...options,
  });
};

// 3. Get Department by ID
export const useGetDepartmentById = (
  departmentId: string | null,
  options?: Omit<
    UseQueryOptions<
      Department,
      ApiErrorResponse,
      Department,
      [string, string | null]
    >,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<
    Department,
    ApiErrorResponse,
    Department,
    [string, string | null]
  >({
    queryKey: [DEPARTMENTS_QUERY_KEY, departmentId],
    queryFn: () => {
      if (!departmentId) throw new Error("Department ID is required");
      return customFetch<Department>(`/departments/${departmentId}`);
    },
    enabled: !!departmentId, // Only run if departmentId is provided
    ...options,
  });
};

// 4. Update Department
export const useUpdateDepartmentMutation = (
  options?: UseMutationOptions<
    Department,
    ApiErrorResponse,
    { id: string; data: UpdateDepartmentDto }
  >
) => {
  return useMutation<
    Department,
    ApiErrorResponse,
    { id: string; data: UpdateDepartmentDto }
  >({
    mutationFn: ({ id, data }) =>
      customFetch<Department>(`/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    ...options,
  });
};

// 5. Delete Department
export const useDeleteDepartmentMutation = (
  options?: UseMutationOptions<Department, ApiErrorResponse, string>
) => {
  return useMutation<Department, ApiErrorResponse, string>({
    mutationFn: (departmentId) =>
      customFetch<Department>(`/departments/${departmentId}`, {
        method: "DELETE",
      }),
    ...options,
  });
};
