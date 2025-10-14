"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Search, Filter, X, CalendarIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { ChatSessionStatus } from "@/types";
import { Department, AgentProfile } from "@/types";
import { cn } from "@/lib/utils";
import { HistorySearchFiltersSkeleton } from "./history-search-filters-skeleton";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface HistoryFilters {
  search: string;
  //status: string | "all";
  agentId: string | "all";
  departmentId: string | "all";
  customerName: string;
  customerEmail: string;
  hasScheduledAppointment: string | "all";
  startDate: string;
  endDate: string;
}

interface HistorySearchFiltersProps {
  filters: HistoryFilters;
  onFiltersChange: (filters: HistoryFilters) => void;
  departments: Department[];
  agents: AgentProfile[];
  onClearFilters: () => void;
  isLoading?: boolean;
}

const historyStatusOptions: ChatSessionStatus[] = [
  "PENDING_ASSIGNMENT",
  "ACTIVE",
  "RESOLVED",
  "CLOSED_BY_AGENT",
  "CLOSED_BY_CUSTOMER",
  "ABANDONED_BY_CUSTOMER",
  "PENDING_AGENT_RECONNECT",
  "ABANDONED_BY_AGENT",
  "EXPIRED_PENDING_ASSIGNMENT",
  "OFFLINE_MESSAGE",
];

export default function HistorySearchFilters({
  filters,
  onFiltersChange,
  departments,
  agents,
  onClearFilters,
  isLoading = false,
}: HistorySearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Local state for customer name and email inputs
  const [localCustomerName, setLocalCustomerName] = useState(
    filters.customerName
  );
  const [localCustomerEmail, setLocalCustomerEmail] = useState(
    filters.customerEmail
  );

  // Local state for date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (filters.startDate && filters.endDate) {
      return {
        from: new Date(filters.startDate),
        to: new Date(filters.endDate),
      };
    }
    return undefined;
  });

  // Debounced values for customer name and email
  const debouncedCustomerName = useDebounce(localCustomerName, 500);
  const debouncedCustomerEmail = useDebounce(localCustomerEmail, 500);

  // Update parent filters when debounced values change
  useEffect(() => {
    if (debouncedCustomerName !== filters.customerName) {
      onFiltersChange({ ...filters, customerName: debouncedCustomerName });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCustomerName]);

  useEffect(() => {
    if (debouncedCustomerEmail !== filters.customerEmail) {
      onFiltersChange({ ...filters, customerEmail: debouncedCustomerEmail });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedCustomerEmail]);

  // Update parent filters when date range changes
  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      const startDate = new Date(dateRange.from);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(dateRange.to);
      endDate.setHours(23, 59, 59, 999);

      const startDateISO = startDate.toISOString();
      const endDateISO = endDate.toISOString();

      if (
        startDateISO !== filters.startDate ||
        endDateISO !== filters.endDate
      ) {
        onFiltersChange({
          ...filters,
          startDate: startDateISO,
          endDate: endDateISO,
        });
      }
    } else if (!dateRange && (filters.startDate || filters.endDate)) {
      onFiltersChange({ ...filters, startDate: "", endDate: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Sync local state when filters change from parent (e.g., when clearing filters)
  useEffect(() => {
    setLocalCustomerName(filters.customerName);
  }, [filters.customerName]);

  useEffect(() => {
    setLocalCustomerEmail(filters.customerEmail);
  }, [filters.customerEmail]);

  useEffect(() => {
    if (!filters.startDate && !filters.endDate) {
      setDateRange(undefined);
    } else if (filters.startDate && filters.endDate) {
      setDateRange({
        from: new Date(filters.startDate),
        to: new Date(filters.endDate),
      });
    }
  }, [filters.startDate, filters.endDate]);

  if (isLoading) {
    return <HistorySearchFiltersSkeleton />;
  }

  const handleInputChange = (field: keyof HistoryFilters, value: string) => {
    // Handle customer name and email with local state for debouncing
    if (field === "customerName") {
      setLocalCustomerName(value);
    } else if (field === "customerEmail") {
      setLocalCustomerEmail(value);
    } else {
      // For other fields, update immediately
      onFiltersChange({ ...filters, [field]: value });
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== "all"
  );

  return (
    <div className="space-y-4">
      {/* Search Bar and Toggle */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by customer name or email..."
            value={filters.search}
            onChange={(e) => handleInputChange("search", e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "transition-all duration-200",
            isExpanded
              ? "bg-primary text-primary-foreground border-primary shadow-md"
              : ""
          )}
        >
          <Filter className="h-4 w-4" /> Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" size="icon" onClick={onClearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Agent Filter */}
          <div className="space-y-2">
            <Label htmlFor="agentId">Agent</Label>
            <Select
              value={filters.agentId}
              onValueChange={(value) => handleInputChange("agentId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.userId} value={agent.userId}>
                    {agent.user.firstName} {agent.user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Department Filter */}
          <div className="space-y-2">
            <Label htmlFor="departmentId">Department</Label>
            <Select
              value={filters.departmentId}
              onValueChange={(value) =>
                handleInputChange("departmentId", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department._id} value={department._id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Name Filter */}
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              placeholder="Filter by customer name..."
              value={localCustomerName}
              onChange={(e) =>
                handleInputChange("customerName", e.target.value)
              }
            />
          </div>

          {/* Customer Email Filter */}
          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email</Label>
            <Input
              placeholder="Filter by customer email..."
              value={localCustomerEmail}
              onChange={(e) =>
                handleInputChange("customerEmail", e.target.value)
              }
            />
          </div>

          {/* Has Scheduled Appointment Filter */}
          <div className="space-y-2">
            <Label htmlFor="hasScheduledAppointment">Appointment Status</Label>
            <Select
              value={filters.hasScheduledAppointment}
              onValueChange={(value) =>
                handleInputChange("hasScheduledAppointment", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All Appointments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Appointments</SelectItem>
                <SelectItem value="true">Has Scheduled Appointment</SelectItem>
                <SelectItem value="false">No Scheduled Appointment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                        {format(dateRange.to, "MMM dd, yyyy")}
                      </>
                    ) : (
                      format(dateRange.from, "MMM dd, yyyy")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
                {dateRange && (
                  <div className="p-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setDateRange(undefined)}
                    >
                      Clear dates
                    </Button>
                  </div>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
    </div>
  );
}
