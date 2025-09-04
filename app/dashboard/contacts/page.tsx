"use client";

import { useGetContacts } from "@/lib/contact.api";
import { cn } from "@/lib/utils";
import { ContactFilters } from "@/types/contact";
import { motion } from "framer-motion";
import { Users, Search } from "lucide-react";
import { useMemo, useState } from "react";
import ContactTable from "./_components/contact-table";
import SearchFilters from "./_components/search-filters";

export default function ContactsPage() {
  const [filters, setFilters] = useState<ContactFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    data: contactData,
    isLoading: isLoadingContacts,
    error: contactsError,
  } = useGetContacts(filters);

  const contacts = contactData?.items || [];

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

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
              <span className="p-2 bg-blue-500 text-white mr-1 rounded-md">
                <Users className="text-2xl" />
              </span>
              Contacts
            </h1>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mx-4 mb-6">
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        <ContactTable
          contactData={contactData || null}
          isLoadingContacts={isLoadingContacts}
          contactsError={contactsError || null}
          currentPage={filters.page || 1}
          onPageChange={handlePageChange}
        />
      </div>
    </motion.div>
  );
}
