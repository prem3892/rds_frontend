"use client";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/stores/auth";
import { useGetAllChatSessionsInfinite, useGetChatMessages } from "@/lib/chat.api";
import { useGetAllAgents } from "@/lib/agent.api";
import { useGetAllDepartments } from "@/lib/department.api";
import {
  ChatSession,
  GetChatSessionsQueryDto,
  ChatSessionStatus,
} from "@/types";
import { motion } from "framer-motion";
import { HistoryIcon } from "lucide-react";

import HistoryChatSidebar from "./_components/history-chat-sidebar";
import HistoryChatMessages from "./_components/history-chat-messages";
import HistoryGuestInfo from "./_components/history-guest-info";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import HistorySearchFilters from "./_components/history-search-filters";

interface HistoryFilters {
  search: string;
  status: string | "all";
  agentId: string | "all";
  departmentId: string | "all";
  customerName: string;
  customerEmail: string;
  hasScheduledAppointment: string | "all";
}

const HistoryPageSkeleton = () => (
  <div className="mx-auto p-2 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full">
    <div className="bg-white rounded-3xl p-2 sm:p-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mx-2 sm:mx-4 mt-4 mb-6">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Search Filters Skeleton */}
      <div className="mx-2 sm:mx-4 mb-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-10 w-80 rounded-md" />
            <Skeleton className="h-10 w-20 rounded-md" />
            <Skeleton className="h-10 w-10 rounded-md" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="mx-2 sm:mx-4">
        <div className="flex gap-4 h-[600px] overflow-hidden">
          {/* Left Sidebar Skeleton */}
          <div className="w-96 flex-shrink-0 h-full">
            <div className="w-full h-full flex rounded-3xl flex-col border bg-white shadow-sm overflow-hidden">
              <div className="p-2 sm:p-3 h-full flex flex-col">
                <div className="flex-1 min-h-0 overflow-hidden">
                  <div className="space-y-3 p-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <Skeleton className="h-12 w-full rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-2 border-t border-gray-100 flex-shrink-0">
                  <div className="flex justify-center space-x-2">
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                    <Skeleton className="h-8 w-8 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Skeleton */}
          <div className="flex-1 bg-white rounded-xl border h-full overflow-hidden">
            <div className="h-full flex flex-col">
              {/* Guest Info Skeleton */}
              <div className="p-4 border-b flex-shrink-0">
                <div className="w-full">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-2" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-6 w-24 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Chat Messages Skeleton */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <div className="h-full p-2 sm:p-4 space-y-1 bg-gray-50">
                  <div className="space-y-4">
                    {/* Date Separator Skeleton */}
                    <div className="flex items-center justify-center my-3 sm:my-4">
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                    
                    {/* Message Skeletons */}
                    {Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start gap-3">
                          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                          <div className="flex-1 space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-16 w-64 rounded-lg" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function HistoryNewPage() {
  const currentUser = useCurrentUser();
  const isMobile = useIsMobile();
  const [isTablet, setIsTablet] = useState(false);
  const [filters, setFilters] = useState<HistoryFilters>({
    search: "",
    status: "all",
    agentId: "",
    departmentId: "all",
    customerName: "",
    customerEmail: "",
    hasScheduledAppointment: "all",
  });
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [pageSize] = useState(10);
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  // Check for tablet view (768px to 1024px)
  useEffect(() => {
    const checkTabletView = () => {
      const width = window.innerWidth;
      setIsTablet(width >= 768 && width < 1024);
    };

    checkTabletView();
    window.addEventListener("resize", checkTabletView);
    return () => window.removeEventListener("resize", checkTabletView);
  }, []);

  // Get agents and departments for filters
  const { data: agents } = useGetAllAgents({
    enabled: currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER",
  });

  const { data: departments } = useGetAllDepartments({
    enabled: currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER",
  });

  useEffect(() => {
    if (currentUser?.role === "AGENT" || currentUser?.role === "MANAGER") {
      setFilters((prev) => ({
        ...prev,
        agentId: currentUser.id,
      }));
    }
  }, [currentUser]);

  // Convert filters to API format
  const apiFilters: Omit<GetChatSessionsQueryDto, "page"> = {
    limit: pageSize,
    status: filters.status && filters.status !== "all" ? (filters.status as ChatSessionStatus) : undefined,
    agentId: filters.agentId && filters.agentId !== "all" ? filters.agentId : undefined,
    departmentId: filters.departmentId && filters.departmentId !== "all" ? filters.departmentId : undefined,
    customerName: filters.customerName || undefined,
    customerEmail: filters.customerEmail || undefined,
    hasScheduledAppointment: filters.hasScheduledAppointment && filters.hasScheduledAppointment !== "all" ? filters.hasScheduledAppointment === "true" : undefined,
  };

  const {
    data: sessions,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetAllChatSessionsInfinite(apiFilters, {
    enabled: !!currentUser,
  });

  const { data: messages, isLoading: isLoadingMessages } = useGetChatMessages(
    selectedSession?._id || null
  );

  // Filter sessions based on search term (client-side filtering for search)
  const filteredSessions = sessions?.filter((session) => {
    if (!filters.search) return true;
    
    const searchTerm = filters.search.toLowerCase();
    const customerName = session.customerId?.name?.toLowerCase() || '';
    const customerEmail = session.customerId?.email?.toLowerCase() || '';
    
    return customerName.includes(searchTerm) || customerEmail.includes(searchTerm);
  }) || [];

  const handleFiltersChange = (newFilters: HistoryFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: HistoryFilters = {
      search: "",
      status: "all",
      agentId: (currentUser?.role === "AGENT" || currentUser?.role === "MANAGER") ? currentUser.id : "all",
      departmentId: "all",
      customerName: "",
      customerEmail: "",
      hasScheduledAppointment: "all",
    };
    setFilters(clearedFilters);
  };

  const handleSelectSession = (session: ChatSession) => {
    setSelectedSession(session);
    if (isMobile || isTablet) {
      setMobileView('chat');
    }
  };

  const handleBackToList = () => {
    setMobileView('list');
    setSelectedSession(null);
  };

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-2 sm:p-4 md:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
    >
      <div className="bg-white rounded-3xl p-2 sm:p-4 md:p-3 lg:p-4">
        <div className="flex justify-between items-center mx-2 sm:mx-4 md:mx-3 lg:mx-4 mt-4 mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold flex items-center">
              <span className="p-2 bg-blue-500 text-white mr-1 rounded-md">
                <HistoryIcon className="text-lg sm:text-2xl md:text-xl lg:text-2xl" />
              </span>
              Chat History
            </h1>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mx-2 sm:mx-4 md:mx-3 lg:mx-4 mb-4 sm:mb-6">
          <HistorySearchFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            departments={departments || []}
            agents={agents || []}
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
          />
        </div>

        {/* Main Content Area */}
        <div className="mx-2 sm:mx-4 md:mx-3 lg:mx-4">
          {isLoading && <HistoryPageSkeleton />}
          
          {error && (
            <div className="text-center py-8">
              <p className="text-red-500">Error loading history: {error.message}</p>
            </div>
          )}

          {filteredSessions && filteredSessions.length > 0 && (
            <>
              {/* Mobile & Tablet View */}
              {(isMobile || isTablet) ? (
                <div className="h-[calc(100vh-280px)] sm:h-[600px] lg:h-[600px] overflow-hidden">
                  {mobileView === 'list' ? (
                    /* Chat List View */
                    <div className="h-full">
                      <HistoryChatSidebar
                        sessions={filteredSessions}
                        selectedSessionId={selectedSession?._id || null}
                        onSelectSession={handleSelectSession}
                        isLoading={isLoading}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        onLoadMore={handleLoadMore}
                      />
                    </div>
                  ) : (
                    /* Chat Messages View */
                    <div className="h-full bg-white rounded-xl border overflow-hidden">
                      {selectedSession && (
                        <div className="h-full flex flex-col">
                          {/* Back Button and Guest Info */}
                          <div className="p-3 sm:p-4 md:p-3 border-b flex-shrink-0">
                            <div className="space-y-3">
                              {/* Back Button - Fixed position */}
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleBackToList}
                                  className="p-2 h-auto flex-shrink-0"
                                >
                                  <ArrowLeft className="h-4 w-4" />
                                </Button>
                              </div>
                              {/* Guest Info - Separate container */}
                              <div className="w-full">
                                <HistoryGuestInfo session={selectedSession} />
                              </div>
                            </div>
                          </div>
                          
                          {/* Chat Messages */}
                          <div className="flex-1 min-h-0 overflow-hidden">
                            <HistoryChatMessages
                              messages={messages || []}
                              isLoading={isLoadingMessages}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                /* Desktop View (1024px and above) */
                <div className="flex gap-4 h-[600px] overflow-hidden">
                  {/* Left Sidebar - Chat List */}
                  <div className="w-96 xl:w-80 2xl:w-96 flex-shrink-0 h-full">
                    <HistoryChatSidebar
                      sessions={filteredSessions}
                      selectedSessionId={selectedSession?._id || null}
                      onSelectSession={handleSelectSession}
                      isLoading={isLoading}
                      hasNextPage={hasNextPage}
                      isFetchingNextPage={isFetchingNextPage}
                      onLoadMore={handleLoadMore}
                    />
                  </div>

                  {/* Right Side - Chat Messages */}
                  <div className="flex-1 bg-white rounded-xl border h-full overflow-hidden">
                    {selectedSession ? (
                      <div className="h-full flex flex-col">
                        {/* Guest Info Button */}
                        <div className="p-4 border-b flex-shrink-0">
                          <HistoryGuestInfo session={selectedSession} />
                        </div>
                        
                        {/* Chat Messages */}
                        <div className="flex-1 min-h-0 overflow-hidden">
                          <HistoryChatMessages
                            messages={messages || []}
                            isLoading={isLoadingMessages}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <HistoryIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">Select any chat to view conversation history</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {filteredSessions && filteredSessions.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <p className="text-gray-500">No chat history found for the selected filters.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

