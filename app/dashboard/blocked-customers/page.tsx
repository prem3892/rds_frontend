"use client";

import { useGetBlockedCustomers } from "@/lib/blocked-customer.api";
import { cn } from "@/lib/utils";
import { BlockedCustomerFilters } from "@/types/blocked-customer";
import { motion } from "framer-motion";
import { ShieldX, Search } from "lucide-react";
import { useMemo, useState } from "react";
import BlockedCustomerTable from "./_components/blocked-customer-table";
import SearchFilters from "./_components/search-filters";

export default function BlockedCustomersPage() {
  const [filters, setFilters] = useState<BlockedCustomerFilters>({
    page: 1,
    limit: 10,
    sortBy: "blockedAt",
    sortOrder: "desc",
  });

  const {
    data: blockedCustomerData,
    isLoading: isLoadingBlockedCustomers,
    error: blockedCustomersError,
  } = useGetBlockedCustomers(filters);

  const blockedCustomers = blockedCustomerData?.items || [];

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };
  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({ ...prev, limit: size, page: 1 }));
  };

  // Extract unique domains and widgets for filters
  const availableDomains = useMemo(() => {
    const domains = new Set<string>();
    blockedCustomers.forEach((customer) => {
      if (customer.metadata?.initialDomain) domains.add(customer.metadata.initialDomain);
    });
    return Array.from(domains).sort();
  }, [blockedCustomers]);

  const availableWidgets = useMemo(() => {
    const widgets = new Set<string>();
    blockedCustomers.forEach((customer) => {
      if (customer.widgetId?.name) widgets.add(customer.widgetId.name);
    });
    return Array.from(widgets).sort();
  }, [blockedCustomers]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-4 md:p-6 lg:p-8 space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
    >
      <div className="bg-white rounded-3xl p-4">
        <div className="flex justify-between items-center mx-4 mt-4 mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
              <span className="p-2 bg-red-500 text-white mr-1 rounded-md">
                <ShieldX className="text-2xl" />
              </span>
              Blocked Customers
            </h1>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mx-4 mb-6">
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableDomains={availableDomains}
            availableWidgets={availableWidgets}
          />
        </div>

        <BlockedCustomerTable
          blockedCustomerData={blockedCustomerData || null}
          isLoadingBlockedCustomers={isLoadingBlockedCustomers}
          blockedCustomersError={blockedCustomersError || null}
          currentPage={filters.page || 1}
          onPageChange={handlePageChange}
          pageSize={filters.limit}
          onPageSizeChange={handlePageSizeChange}
        />
      </div>
    </motion.div>
  );
}
