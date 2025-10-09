"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { X, BarChart3 } from "lucide-react";
import { AgentProfile, useGetAgentMetrics, AgentMetricsFilters } from "@/lib/agent.api";
import { cn } from "@/lib/utils";

// Helper function to get the full image URL
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return undefined;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  return `${API_BASE_URL}${imagePath}`;
};

interface AgentMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentProfile | null;
}

const timeFilterOptions = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last Week" },
  { value: "last_month", label: "Last Month" },
];

export const AgentMetricsModal = ({ isOpen, onClose, agent }: AgentMetricsModalProps) => {
  const [filters, setFilters] = useState<AgentMetricsFilters>({
    timeFilter: "today",
    domain: "",
    page: 1,
    limit: 10,
  });

  const { data: metricsData, isLoading, error } = useGetAgentMetrics(
    agent?._id || "",
    filters,
    {
      enabled: !!agent?._id && isOpen,
    }
  );

  const handleFilterChange = (key: keyof AgentMetricsFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      timeFilter: "today",
      domain: "",
      page: 1,
      limit: 10,
    });
  };

  const handleSearch = () => {
    // The query will automatically refetch when filters change
    // This is just for UI feedback
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({
      ...prev,
      page,
    }));
  };

  const handlePageSizeChange = (size: number) => {
    setFilters(prev => ({
      ...prev,
      limit: size,
      page: 1, // Reset to first page when page size changes
    }));
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatResponseTime = (timeString: string) => {
    if (!timeString || timeString === "0:0:0") return "0:00:00";
    return timeString;
  };

  if (!agent) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className=" sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Agent Metrics
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Filters Section */}
          <div className="flex-shrink-0 bg-gray-50 p-4 rounded-lg">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="timeFilter">Date</Label>
                  <Select
                    value={filters.timeFilter}
                    onValueChange={(value) => handleFilterChange("timeFilter", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeFilterOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domains</Label>
                  <Select
                    value={filters.domain || "all"}
                    onValueChange={(value) => handleFilterChange("domain", value === "all" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All domains" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[200px] overflow-y-auto">
                      <SelectItem value="all">All</SelectItem>
                      {metricsData?.items.map((item) => (
                        <SelectItem key={item.domain} value={item.domain}>
                          {item.domain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                  className="px-6"
                >
                  Clear
                </Button>
                <Button
                  onClick={handleSearch}
                  className="px-6 bg-blue-600 hover:bg-blue-700"
                >
                  Search
                </Button>
              </div>
            </div>
          </div>

          {/* Agent Information */}
          <div className="flex-shrink-0 flex items-center gap-4 p-4 bg-white rounded-lg border">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={agent.profilePicture ? getFullImageUrl(agent.profilePicture) : undefined} 
                alt={`${agent.user.firstName} ${agent.user.lastName}`} 
              />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                {getInitials(agent.user.firstName, agent.user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {agent.user.firstName} {agent.user.lastName}
              </h3>
              <p className="text-gray-600">{agent.user.email}</p>
            </div>
           
          </div>

          {/* Metrics Table */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex-1 border rounded-lg overflow-hidden">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="w-[30%]">Domains</TableHead>
                    <TableHead className="w-[17.5%]">Accepted Chats</TableHead>
                    <TableHead className="w-[17.5%]">Responded Chats</TableHead>
                    <TableHead className="w-[17.5%]">Avg Response Time</TableHead>
                    <TableHead className="w-[17.5%]">Proactive Chats</TableHead>
                    <TableHead className="w-[17.5%]">Total Bookings</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-red-600 py-8">
                        Error loading metrics: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : !metricsData?.items.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                        No metrics data available for the selected period
                      </TableCell>
                    </TableRow>
                  ) : (
                    metricsData.items.map((item) => (
                      <TableRow key={item._id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            {item.domain}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {item.acceptedChats}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {item.respondedChats}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-gray-100 text-gray-800">
                            {formatResponseTime(item.avgResponseTime)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            {item.proactiveChats}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            {item.totalBookings}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination Controls */}
            {metricsData?.meta && (
              <div className="flex-shrink-0 mt-4">
                <PaginationControls
                  currentPage={filters.page || 1}
                  totalPages={metricsData.meta.totalPages}
                  onPageChange={handlePageChange}
                  pageSize={filters.limit}
                  onPageSizeChange={handlePageSizeChange}
                  alwaysShow
                />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
