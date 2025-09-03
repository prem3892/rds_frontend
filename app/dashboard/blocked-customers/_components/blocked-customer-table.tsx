"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ApiErrorResponse } from "@/types";
import { PaginatedBlockedCustomerResponse } from "@/types/blocked-customer";
import { BlockedCustomer } from "@/types/blocked-customer";
import {
  Calendar,
  Clock,
  Globe,
  Monitor,
  ShieldX,
  User,
  Building,
  Unlock,
} from "lucide-react";
import { useState } from "react";
import { createColumns } from "./blocked-customer-columns";
import { BlockedCustomerDataTable } from "./blocked-customer-data-table";
import UnblockCustomerDialog from "./unblock-customer-dialog";
import { useUnblockCustomerMutation } from "@/lib/blocked-customer.api";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BLOCKED_CUSTOMERS_QUERY_KEY } from "@/lib/blocked-customer.api";
import Link from "next/link";

type Props = {
  blockedCustomerData: PaginatedBlockedCustomerResponse | null;
  isLoadingBlockedCustomers: boolean;
  blockedCustomersError: ApiErrorResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
};

// Blocked Customer Card Component for mobile view
const BlockedCustomerCard = ({ customer }: { customer: BlockedCustomer }) => {
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const unblockMutation = useUnblockCustomerMutation({
    onSuccess: () => {
      toast.success("Customer unblocked successfully");
      queryClient.invalidateQueries({
        queryKey: [BLOCKED_CUSTOMERS_QUERY_KEY],
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unblock customer");
    },
  });

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-3">
            {/* Customer ID */}
            <div className="flex items-center gap-2">
              <User className="size-4 text-blue-500 flex-shrink-0" />
              <span className="font-semibold text-sm text-gray-900">
                {customer.name}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  {customer.email}
                </span>
                <p className="text-sm text-gray-700 font-mono">
                  {customer._id}
                </p>
              </div>
            </div>

            {/* Widget */}
            <div className="flex items-center gap-2">
              <Building className="size-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Widget
                </span>
                <p className="text-sm text-gray-700">
                  {customer.widgetId.name}
                </p>
              </div>
            </div>

            {/* Blocked By */}
            <div className="flex items-center gap-2">
              <ShieldX className="size-4 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Blocked By
                </span>
                <p className="text-sm text-gray-700">
                  {customer.blockedBy.firstName} {customer.blockedBy.lastName}
                </p>
                <p className="text-xs text-gray-500">
                  {customer.blockedBy.email}
                </p>
              </div>
            </div>

            {/* Blocked Date */}
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Blocked Date
                </span>
                <p className="text-sm text-gray-700">
                  {new Date(customer.blockedAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Browser Info */}
            <div className="flex items-center gap-2">
              <Monitor className="size-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Browser Info
                </span>
                <p className="text-sm text-gray-700">
                  {customer.metadata?.browserInfo?.platform || "N/A"}
                </p>
                <p className="text-xs text-gray-500">
                  {customer.metadata?.browserInfo?.screenResolution || "N/A"}
                </p>
              </div>
            </div>

            {/* Domain */}
            <Link href={`https://${customer.metadata?.initialDomain}`} className="flex items-center gap-2">
              <Globe className="size-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Domain
                </span>
                <p className="text-sm text-gray-700">
                  {customer.metadata?.initialDomain || "N/A"}
                </p>
              </div>
            </Link>

            {/* Created Date */}
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Created
                </span>
                <p className="text-sm text-gray-700">
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUnblockDialogOpen(true)}
                className="flex-1 h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
              >
                <Unlock className="h-3 w-3 mr-1" />
                Unblock
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Unblock Dialog */}
      <UnblockCustomerDialog
        open={isUnblockDialogOpen}
        onOpenChange={setIsUnblockDialogOpen}
        blockedCustomer={customer}
        onUnblock={() => {
          unblockMutation.mutate({ customerId: customer._id });
          setIsUnblockDialogOpen(false);
        }}
        isLoading={unblockMutation.isPending}
      />
    </Card>
  );
};

export default function BlockedCustomerTable({
  blockedCustomerData,
  isLoadingBlockedCustomers,
  blockedCustomersError,
  currentPage,
  onPageChange,
}: Props) {
  if (isLoadingBlockedCustomers) {
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

  if (blockedCustomersError) {
    return (
      <div className="mx-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600">
              <p className="font-medium">Error loading blocked customers</p>
              <p className="text-sm mt-1">
                {typeof blockedCustomersError.message === "string"
                  ? blockedCustomersError.message
                  : "An unexpected error occurred"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!blockedCustomerData || blockedCustomerData.items.length === 0) {
    return (
      <div className="mx-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <ShieldX className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">No blocked customers found</p>
              <p className="text-sm mt-1">
                When customers are blocked, they will appear here
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
        <BlockedCustomerDataTable
          columns={createColumns()}
          data={blockedCustomerData.items}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {blockedCustomerData.items.map((customer: BlockedCustomer) => (
          <BlockedCustomerCard key={customer._id} customer={customer} />
        ))}
      </div>

      {/* Pagination */}
      {blockedCustomerData.meta.totalPages > 1 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={blockedCustomerData.meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
