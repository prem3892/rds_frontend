export interface Contact {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    fingerprint: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ContactFilters {
  search?: string;
  customer?: string;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "updatedAt" | "firstName" | "lastName" | "email";
  sortOrder?: "asc" | "desc";
}

export interface ContactResponse {
  items: Contact[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface CreateContactRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  customer: string;
}

export interface UpdateContactRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}
