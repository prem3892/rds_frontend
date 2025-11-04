"use client";

import { ContactDataTable } from "./contact-data-table";
import { createColumns } from "./contact-columns";
import { ContactResponse } from "@/types/contact";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Card, CardContent } from "@/components/ui/card";
import ContactMobileCard from "./contact-mobile-card";
import { ApiErrorResponse } from "@/types";

interface ContactTableProps {
  contactData: ContactResponse | null;
  isLoadingContacts: boolean;
  contactsError: ApiErrorResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

export default function ContactTable({
  contactData,
  isLoadingContacts,
  contactsError,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: ContactTableProps) {
  const columns = createColumns();
  const contacts = contactData?.items || [];

  if (isLoadingContacts) {
    return (
      <div className="mx-4">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (contactsError) {
    return (
      <div className="mx-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load contacts: {contactsError.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!contactData || contactData.items.length === 0) {
    return (
      <div className="mx-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">No contacts found</p>
              <p className="text-sm mt-1">
                When contacts are saved from chat sessions, they will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <ContactDataTable columns={columns} data={contacts} />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {contacts.map((contact) => (
          <ContactMobileCard key={contact._id} contact={contact} />
        ))}
      </div>

      {/* Pagination */}
      {contactData.meta.totalPages >= 1 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={contactData.meta.totalPages}
            onPageChange={onPageChange}
            pageSize={pageSize}
            onPageSizeChange={onPageSizeChange}
            alwaysShow
          />
        </div>
      )}
    </div>
  );
}
