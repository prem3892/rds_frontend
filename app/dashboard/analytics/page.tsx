"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCurrentUser } from "@/stores/auth";
import { useGetAnalytics } from "@/lib/analytics.api";
import { useGetAllAgents } from "@/lib/agent.api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import AnalyticsFilters from "./_components/analytics-filters";
import AnalyticsSummaryCards from "./_components/analytics-summary";
import AnalyticsChart from "./_components/analytics-chart";
import AnalyticsTable from "./_components/analytics-table";
import { GetAnalyticsQueryDto } from "@/types";
import { useGetAllWidgetsList } from "@/lib/widget.api";

interface AnalyticsFiltersState {
  startDate: string;
  endDate: string;
  source: string;
  domain: string;
  type: string;
  agentId: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

const AnalyticsPageSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-32 w-full rounded-lg" />
      ))}
    </div>
    <Skeleton className="h-96 w-full rounded-lg" />
    <Skeleton className="h-96 w-full rounded-lg" />
  </div>
);

export default function AnalyticsPage() {
  const currentUser = useCurrentUser();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<AnalyticsFiltersState>({
    startDate: "",
    endDate: "",
    source: "",
    domain: "",
    type: "",
    agentId: "",
    sortBy: "",
    sortOrder: "desc",
  });

  const [domains, setDomains] = useState<string[]>([]);

  // Get agents list for filter dropdown
  const { data: agentsData } = useGetAllAgents({
    enabled: currentUser?.role === "ADMIN" || currentUser?.role === "MANAGER",
  });

  // Build API query parameters
  const apiParams: GetAnalyticsQueryDto = {
    page: currentPage,
    limit: pageSize,
    ...(filters.startDate && { startDate: filters.startDate }),
    ...(filters.endDate && { endDate: filters.endDate }),
    ...(filters.source && { source: filters.source }),
    ...(filters.domain && { domain: filters.domain }),
    ...(filters.type && {
      type: filters.type as "chats" | "appointments" | "both",
    }),
    ...(filters.agentId && { agentId: filters.agentId }),
    ...(filters.sortBy && { sortBy: filters.sortBy as any }),
    ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
    includeDetails: true,
  };

  // For agents, auto-set their own ID if not set
  if (currentUser?.role === "AGENT" && !apiParams.agentId) {
    apiParams.agentId = currentUser.id;
  }

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading,
    error,
  } = useGetAnalytics(apiParams, {
    enabled: !!currentUser,
  });

  // changes here
  const { data: widgetsData } = useGetAllWidgetsList();
  useEffect(() => {
    if (Array.isArray(widgetsData?.items)) {
      if (widgetsData?.items.length > 0) {
        const allDomains = widgetsData.items.flatMap(
          (widget) => widget.domains || []
        );
        const uniqueDomains = Array.from(new Set(allDomains));
        setDomains(uniqueDomains);
      }
    }
  }, [widgetsData?.items]);

  const handleFiltersChange = (newFilters: AnalyticsFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      source: "",
      domain: "",
      type: "",
      agentId: currentUser?.role === "AGENT" ? currentUser.id : "",
      sortBy: "",
      sortOrder: "desc",
    });
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  // Access control
  if (!currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto p-4 md:p-6 lg:p-8 space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
      >
        <AnalyticsPageSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-2 sm:p-4 lg:p-8 space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
    >
      <div className="bg-white rounded-3xl p-2 sm:p-4">
        {/* Header */}
        <div className="flex justify-between items-center mx-2 sm:mx-4 mt-4 mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-semibold flex items-center">
              <span className="p-2 bg-blue-500 text-white mr-1 rounded-md">
                <BarChart3 className="text-lg sm:text-2xl md:text-xl lg:text-2xl" />
              </span>
              Analytics
            </h1>
          </div>
        </div>

        {/* Filters */}
        <div className="mx-2 sm:mx-4 mb-6">
          <AnalyticsFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            agents={agentsData || []}
            domains={domains}
            onClearFilters={handleClearFilters}
            isLoading={isLoading}
            userRole={currentUser?.role}
          />
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mx-2 sm:mx-4 mb-6">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Failed to load analytics data. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="mx-2 sm:mx-4">
            <AnalyticsPageSkeleton />
          </div>
        )}

        {/* Summary Cards + Chart Grid */}
        {!isLoading && analyticsData && (
          <>
            <div className="mx-2 sm:mx-4 mb-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart - Takes 2/3 on desktop, full width on mobile */}
              <div className="lg:col-span-2">
                <AnalyticsChart
                  breakdown={analyticsData.summary?.breakdown}
                  isLoading={isLoading}
                />
              </div>

              {/* Summary Cards - Takes 1/3 on desktop, full width on mobile */}
              <div className="lg:col-span-1">
                <AnalyticsSummaryCards
                  summary={analyticsData.summary}
                  isLoading={isLoading}
                />
              </div>
            </div>

            {/* Table */}
            <div className="mx-2 sm:mx-4">
              <AnalyticsTable
                items={analyticsData.items}
                meta={analyticsData.meta}
                isLoading={isLoading}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !analyticsData && (
          <div className="mx-2 sm:mx-4 text-center py-12">
            <p className="text-muted-foreground">No analytics data available</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
