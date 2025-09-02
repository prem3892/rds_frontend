"use client";

import { Button } from "@/components/ui/button";
import { useGetCannedMessages } from "@/lib/canned.api";
import { useGetAllDepartments } from "@/lib/department.api";
import { cn } from "@/lib/utils";
import { CannedMessageFilters } from "@/types/canned-message";
import { CannedMessage } from "@/types/canned-message";
import { motion } from "framer-motion";
import { MessageSquare, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import CannedMessageTable from "./_components/canned-message-table";
import CreateMessageDialog from "./_components/create-message-dialog";
import SearchFilters from "./_components/search-filters";

export default function CannedMessagesPage() {

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<CannedMessageFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    data: messageData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useGetCannedMessages(filters);

  const { data: departments } = useGetAllDepartments();

  const messages = messageData?.items || [];

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev: CannedMessageFilters) => ({ ...prev, page }));
  };

  // Extract unique tags and departments for filters

  // The 'messages' logical expression could make the dependencies of useEffect Hook (at line 129) change on every render. To fix this, wrap the initialization of 'messages' in its own useMemo() Hook.  react-hooks/exhaustive-deps

  //   const availableTags = useMemo(() => {

  //   const tags = new Set<string>();
  //   messages.forEach(message => {
  //     message.tags.forEach(tag => tags.add(tag));
  //   });
  //   return Array.from(tags).sort();
  // }, [messages]);
const availableTags = useMemo(() => {
  return messages.map((message: CannedMessage) => message.tags).flat().filter((tag: string, index: number, self: string[]) => self.indexOf(tag) === index).sort();
}, [messages]);


  const availableDepartments = useMemo(() => {
    return departments || [];
  }, [departments]);

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
                <MessageSquare className="text-2xl" />
              </span>
              Canned Messages
            </h1>
          </div>
          <Button
            className="bg-[#1B76FF] hover:bg-blue-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className={cn("mr-2 h-4 w-4", "md:hidden size-6 md:mr-0")} /> 
            <span className="hidden md:block">Create New Message</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="mx-4 mb-6">
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={availableTags || []}
            availableDepartments={availableDepartments}
          />
        </div>

        <CannedMessageTable
          messageData={messageData || null}
          isLoadingMessages={isLoadingMessages}
          messagesError={messagesError || null}
          currentPage={filters.page || 1}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Create Message Dialog */}
      <CreateMessageDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        departments={availableDepartments}
      />
    </motion.div>
  );
}
