"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetCannedMessages, useExportCannedMessagesMutation, useBulkDeleteCannedMessagesMutation, CANNED_MESSAGES_QUERY_KEY } from "@/lib/canned.api";
import { useGetAllDepartments } from "@/lib/department.api";
import { cn } from "@/lib/utils";
import { CannedMessageFilters } from "@/types/canned-message";
import { CannedMessage } from "@/types/canned-message";
import { motion } from "framer-motion";
import { MessageSquare, PlusCircle, Upload, Download, Trash2, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import CannedMessageTable from "./_components/canned-message-table";
import CreateMessageDialog from "./_components/create-message-dialog";
import ImportMessagesModal from "./_components/import-messages-modal";
import SearchFilters from "./_components/search-filters";

export default function CannedMessagesPage() {

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [filters, setFilters] = useState<CannedMessageFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const queryClient = useQueryClient();

  const {
    data: messageData,
    isLoading: isLoadingMessages,
    error: messagesError,
  } = useGetCannedMessages(filters);

  const { data: departments } = useGetAllDepartments();

  const exportMutation = useExportCannedMessagesMutation({
    onSuccess: (data) => {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      // Use NEXT_PUBLIC_API_URL for the base URL
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
      const downloadUrl = data.downloadUrl.startsWith('http') 
        ? data.downloadUrl 
        : `${apiBaseUrl}${data.downloadUrl}`;
      
      link.href = downloadUrl;
      link.download = data.filename || 'canned-messages.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Export completed successfully! ${data.totalExported} messages exported.`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to export messages");
    },
  });

  const bulkDeleteMutation = useBulkDeleteCannedMessagesMutation({
    onSuccess: (data) => {
      toast.success(data.message || "Messages deleted successfully!");
      setSelectedRows([]);
      setIsBulkDeleteDialogOpen(false);
      // Invalidate and refetch the canned messages query
      queryClient.invalidateQueries({ queryKey: [CANNED_MESSAGES_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete messages");
    },
  });

  const messages = messageData?.items || [];

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters((prev: CannedMessageFilters) => ({ ...prev, page }));
  };
  const handlePageSizeChange = (size: number) => {
    setFilters((prev: CannedMessageFilters) => ({ ...prev, limit: size, page: 1 }));
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;
    setIsBulkDeleteDialogOpen(true);
  };

  const handleBulkDeleteConfirm = () => {
    bulkDeleteMutation.mutate({ messageIds: selectedRows });
  };

  const handleRowSelectionChange = (selectedIds: string[]) => {
    setSelectedRows(selectedIds);
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
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setIsImportModalOpen(true)}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden md:block">Import</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="border-gray-300 hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden md:block">Export</span>
            </Button>
            <Button
              className="bg-[#1B76FF] hover:bg-blue-600"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <PlusCircle className={cn("mr-2 h-4 w-4", "md:hidden size-6 md:mr-0")} /> 
              <span className="hidden md:block">Create New Message</span>
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mx-4 mb-6">
          <div className="flex items-center justify-between">
            <SearchFilters
              filters={filters}
              onFiltersChange={setFilters}
              availableTags={availableTags || []}
              availableDepartments={availableDepartments}
            />
            {selectedRows.length > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedRows.length})
              </Button>
            )}
          </div>
        </div>

        <CannedMessageTable
          messageData={messageData || null}
          isLoadingMessages={isLoadingMessages}
          messagesError={messagesError || null}
          currentPage={filters.page || 1}
          onPageChange={handlePageChange}
          pageSize={filters.limit}
          onPageSizeChange={handlePageSizeChange}
          {...(selectedRows.length > 0 && { selectedRows })}
          {...(handleRowSelectionChange && { onRowSelectionChange: handleRowSelectionChange })}
        />
      </div>

      {/* Create Message Dialog */}
      <CreateMessageDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        departments={availableDepartments}
      />

      {/* Import Messages Modal */}
      <ImportMessagesModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete {selectedRows.length} canned message{selectedRows.length > 1 ? 's' : ''} and remove {selectedRows.length > 1 ? 'them' : 'it'} from your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBulkDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBulkDeleteConfirm}
              disabled={bulkDeleteMutation.isPending}
            >
              {bulkDeleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedRows.length} Message${selectedRows.length > 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
