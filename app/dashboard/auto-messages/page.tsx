"use client";

import { Button } from "@/components/ui/button";
import { useGetAutoMessages } from "@/lib/auto-message.api";
import { useGetAllWidgetsList } from "@/lib/widget.api";
import { cn } from "@/lib/utils";
import { AutoMessage, AutoMessageFilters } from "@/types/auto-message";
import { motion } from "framer-motion";
import { MessageSquare, PlusCircle } from "lucide-react";
import { useMemo, useState } from "react";
import AutoMessageTable from "./_components/auto-message-table";
import CreateAutoMessageDialog from "./_components/create-auto-message-dialog";
import SearchFilters from "./_components/search-filters";

export default function AutoMessagesPage() {

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [filters, setFilters] = useState<AutoMessageFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    data: messageData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useGetAutoMessages(filters);

  const { data: widgetsData } = useGetAllWidgetsList(); // Get all widgets for filters

  const messages = messageData?.items || [];
  const widgets = widgetsData?.items || [];

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Extract unique domains and widgets for filters
  const availableDomains = useMemo(() => {
    const domains = new Set<string>();
    messages.forEach((message: AutoMessage) => {
      if (message.domain) domains.add(message.domain);
    });
    return Array.from(domains).sort();
  }, [messages]);

  const availableWidgets = useMemo(() => {
    return widgets || [];
  }, [widgets]);

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
              Auto Messages
            </h1>
          </div>
          <Button
            className="bg-[#1B76FF] hover:bg-blue-600"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <PlusCircle className={cn("mr-2 h-4 w-4", "md:hidden size-6 md:mr-0")} /> 
            <span className="hidden md:block">Create New Auto Message</span>
          </Button>
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

        <AutoMessageTable
          messageData={messageData || null}
          isLoadingMessages={isLoadingMessages}
          messagesError={messagesError || null}
          currentPage={filters.page || 1}
          onPageChange={handlePageChange}
          widgets={availableWidgets}
        />
      </div>

      {/* Create Auto Message Dialog */}
      <CreateAutoMessageDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        widgets={availableWidgets}
      />
    </motion.div>
  );
}
