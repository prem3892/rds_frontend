import {
  useMutation,
  useQuery,
  useQueryClient,
  UseMutationOptions,
  UseQueryOptions,
} from "@tanstack/react-query";
import { customFetch } from "./api";
import { Contact, ContactFilters, ContactResponse, CreateContactRequest, UpdateContactRequest } from "@/types/contact";
import { ApiErrorResponse } from "@/types";

// Query key constants
export const CONTACTS_QUERY_KEY = "contacts";

// 1. Get Contacts with Pagination & Filtering
export const useGetContacts = (
  filters: ContactFilters,
  options?: Omit<
    UseQueryOptions<ContactResponse, ApiErrorResponse, ContactResponse, [string, ContactFilters]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<ContactResponse, ApiErrorResponse, ContactResponse, [string, ContactFilters]>({
    queryKey: [CONTACTS_QUERY_KEY, filters],
    queryFn: () => {
      const params = new URLSearchParams();
      
      if (filters.search) params.append("search", filters.search);
      if (filters.customer) params.append("customer", filters.customer);
      if (filters.page) params.append("page", filters.page.toString());
      if (filters.limit) params.append("limit", filters.limit.toString());
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const queryString = params.toString();
      const url = queryString ? `/contacts?${queryString}` : "/contacts";
      
      return customFetch<ContactResponse>(url);
    },
    ...options,
  });
};

// 2. Get Contact by ID
export const useGetContact = (
  id: string | null,
  options?: Omit<
    UseQueryOptions<Contact, ApiErrorResponse, Contact, [string, string | null]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Contact, ApiErrorResponse, Contact, [string, string | null]>({
    queryKey: [CONTACTS_QUERY_KEY, id],
    queryFn: () => {
      if (!id) throw new Error("Contact ID is required");
      return customFetch<Contact>(`/contacts/${id}`);
    },
    enabled: !!id,
    ...options,
  });
};

// 3. Get Contacts by Customer ID
export const useGetContactsByCustomer = (
  customerId: string | null,
  options?: Omit<
    UseQueryOptions<Contact[], ApiErrorResponse, Contact[], [string, string, string | null]>,
    "queryKey" | "queryFn"
  >
) => {
  return useQuery<Contact[], ApiErrorResponse, Contact[], [string, string, string | null]>({
    queryKey: [CONTACTS_QUERY_KEY, "customer", customerId],
    queryFn: () => {
      if (!customerId) throw new Error("Customer ID is required");
      return customFetch<Contact[]>(`/contacts/customer/${customerId}`);
    },
    enabled: !!customerId,
    ...options,
  });
};

// 4. Create Contact
export const useCreateContact = (
  options?: UseMutationOptions<Contact, ApiErrorResponse, CreateContactRequest>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<Contact, ApiErrorResponse, CreateContactRequest>({
    mutationFn: (data: CreateContactRequest) =>
      customFetch<Contact>("/contacts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    },
    ...options,
  });
};

// 5. Update Contact
export const useUpdateContact = (
  options?: UseMutationOptions<
    Contact,
    ApiErrorResponse,
    { id: string; data: UpdateContactRequest }
  >
) => {
  const queryClient = useQueryClient();
  
  return useMutation<
    Contact,
    ApiErrorResponse,
    { id: string; data: UpdateContactRequest }
  >({
    mutationFn: ({ id, data }) =>
      customFetch<Contact>(`/contacts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY, id] });
    },
    ...options,
  });
};

// 6. Delete Contact
export const useDeleteContact = (
  options?: UseMutationOptions<{ message: string }, ApiErrorResponse, string>
) => {
  const queryClient = useQueryClient();
  
  return useMutation<{ message: string }, ApiErrorResponse, string>({
    mutationFn: (id: string) =>
      customFetch<{ message: string }>(`/contacts/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CONTACTS_QUERY_KEY] });
    },
    ...options,
  });
};
