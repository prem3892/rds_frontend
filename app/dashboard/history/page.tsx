// src/app/(dashboard)/history/page.tsx
"use client";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetAllAgents } from "@/lib/agent.api";
import { useGetAllChatSessions, useGetChatMessages } from "@/lib/api";
import { useGetAllDepartments } from "@/lib/department.api";
import { useCurrentUser } from "@/stores/auth";
import {
  ChatMessage,
  ChatSession,
  ChatSessionStatus,
  GetChatSessionsQueryDto,
} from "@/types";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { HistoryIcon, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  HistoryMobileCard,
  HistorySearchFilters,
  createHistoryColumns,
} from "./_components";

// const historyStatusOptions: ChatSessionStatus[] = [
//   "RESOLVED",
//   "CLOSED_BY_AGENT",
//   "CLOSED_BY_CUSTOMER",
//   "ABANDONED_BY_CUSTOMER",
//   "ABANDONED_BY_AGENT",
//   "EXPIRED_PENDING_ASSIGNMENT",
//   "OFFLINE_MESSAGE",
// ];

interface HistoryFilters {
  search: string;
  status: string;
  agentId: string;
  departmentId: string;
  customerName: string;
  customerEmail: string;
}

export default function ChatHistoryPage() {
  const currentUser = useCurrentUser();
  const [filters, setFilters] = useState<HistoryFilters>({
    search: "",
    status: "all",
    agentId: "",
    departmentId: "all",
    customerName: "",
    customerEmail: "",
  });
  const [selectedSessionForMessages, setSelectedSessionForMessages] =
    useState<ChatSession | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20); // API default

  // Get agents and departments for filters
  const { data: agents } = useGetAllAgents({
    enabled: currentUser?.role === "ADMIN",
  });

  const { data: departments } = useGetAllDepartments({
    enabled: currentUser?.role === "ADMIN",
  });

  useEffect(() => {
    if (currentUser?.role === "AGENT") {
      setFilters((prev) => ({
        ...prev,
        agentId: currentUser.id,
      }));
    }
  }, [currentUser]);

  // Convert filters to API format
  const apiFilters: GetChatSessionsQueryDto = {
    limit: pageSize,
    page: currentPage,
    status: filters.status && filters.status !== "all" ? (filters.status as ChatSessionStatus) : undefined,
    agentId: filters.agentId && filters.agentId !== "all" ? filters.agentId : undefined,
    departmentId: filters.departmentId && filters.departmentId !== "all" ? filters.departmentId : undefined,
    customerName: filters.customerName || undefined,
    customerEmail: filters.customerEmail || undefined,
  };

  const {
    data: sessions,
    isLoading,
    error,
    
  } = useGetAllChatSessions(apiFilters, {
    enabled: !!currentUser,
  });

  const { data: messages, isLoading: isLoadingMessages } = useGetChatMessages(
    selectedSessionForMessages?._id || null
  );

  // Explicitly type messages to avoid TypeScript inference issues
  const typedMessages: ChatMessage[] = messages || [];

  const handleFiltersChange = (newFilters: HistoryFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleClearFilters = () => {
    const clearedFilters: HistoryFilters = {
      search: "",
      status: "all",
      agentId: currentUser?.role === "AGENT" ? currentUser.id : "all",
      departmentId: "all",
      customerName: "",
      customerEmail: "",
    };
    setFilters(clearedFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewMessages = (session: ChatSession) => {
    setSelectedSessionForMessages(session);
  };

  // Filter sessions based on search term (client-side filtering for search)
  const filteredSessions = sessions?.filter((session) => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    const customerName = session.customerId.name.toLowerCase();
    const customerEmail = session.customerId.email.toLowerCase();
    
    return customerName.includes(searchTerm) || customerEmail.includes(searchTerm);
  }) || [];

  // Paginate filtered sessions
  const paginatedSessions = filteredSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-2 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
    >
      <div className="bg-white rounded-3xl p-2 sm:p-4">
        <div className="flex justify-between items-center mx-2 sm:mx-4 mt-4 mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
              <span className="p-2 bg-blue-500 text-white mr-1 rounded-md">
                <HistoryIcon className="text-2xl" />
              </span>
              Chat History
            </h1>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mx-2 sm:mx-4 mb-6">
          <HistorySearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            departments={departments || []}
            agents={agents || []}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* History Table/Cards */}
        <div className="mx-2 sm:mx-4">
          {isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading history...</p>
            </div>
          )}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading history: {error.message}</p>
            </div>
          )}

          {filteredSessions && filteredSessions.length > 0 && (
            <div className="bg-white p-2 sm:p-4 rounded-xl">
              {/* Mobile Card View */}
              <div className="block md:hidden">
                <div className="space-y-4">
                  {paginatedSessions.map((session) => (
                    <HistoryMobileCard
                      key={session._id}
                      session={session}
                      onViewMessages={handleViewMessages}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <DataTable 
                  columns={createHistoryColumns(handleViewMessages)} 
                  data={paginatedSessions} 
                  isLoading={isLoading}
                  skeletonRows={8}
                />
              </div>
              
              {/* Pagination Controls */}
              {filteredSessions.length > pageSize && (
                <div className="mt-6">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={Math.ceil(filteredSessions.length / pageSize)}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          )}

          {filteredSessions && filteredSessions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No chat history found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Messages Dialog */}
      {selectedSessionForMessages && (
        <Dialog
          open={!!selectedSessionForMessages}
          onOpenChange={(isOpen) =>
            !isOpen && setSelectedSessionForMessages(null)
          }
        >
          <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
            <DialogHeader className="px-6 py-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat Session: {selectedSessionForMessages._id.slice(-8)}
              </DialogTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Customer:</strong> {selectedSessionForMessages.customerId.name} ({selectedSessionForMessages.customerId.email})</p>
                <p><strong>Agent:</strong> {selectedSessionForMessages.agentId.firstName} {selectedSessionForMessages.agentId.lastName}</p>
                <p><strong>Status:</strong> <Badge variant="outline">{selectedSessionForMessages.status.replace(/_/g, " ")}</Badge></p>
              </div>
            </DialogHeader>
            
            <div className="flex-1 bg-gray-100 overflow-hidden">
              <ScrollArea className="h-full p-4">
                {isLoadingMessages && typedMessages.length === 0 && (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-muted-foreground">Loading messages...</p>
                  </div>
                )}
                
                {typedMessages.length > 0 && (
                  <div className="space-y-4">
                    {typedMessages.map((msg: ChatMessage) => (
                      <div
                        key={msg._id}
                        className={`flex ${msg.senderType === "AGENT" || msg.senderType === "SYSTEM" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
                            msg.senderType === "SYSTEM"
                              ? "bg-slate-200 text-slate-700 mx-auto"
                              : msg.senderType === "AGENT"
                              ? "bg-blue-600 text-white rounded-br-none"
                              : "bg-white border border-gray-200 rounded-bl-none"
                          }`}
                        >
                          {msg.senderType !== "SYSTEM" && (
                            <p className="text-xs font-semibold mb-1 opacity-70">
                              {msg.senderType === "AGENT" ? "Agent" : "Customer"}
                            </p>
                          )}
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {msg.content.text || JSON.stringify(msg.content)}
                          </p>
                          <div className="flex items-center justify-end gap-1 mt-1">
                            <p
                              className={`text-xs ${
                                msg.senderType === "AGENT"
                                  ? "text-blue-200"
                                  : "text-muted-foreground/80"
                              }`}
                            >
                              {format(parseISO(msg.timestamp), "HH:mm")}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!isLoadingMessages && typedMessages.length === 0 && (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-center text-muted-foreground">
                      No messages in this session.
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
