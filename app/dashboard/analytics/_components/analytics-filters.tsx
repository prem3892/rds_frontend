"use client";

import { Input } from "@/components/ui/input";
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
import { Filter, X, CalendarIcon, Settings2 } from "lucide-react";
import { useState, useEffect } from "react";
import { AgentProfile } from "@/types";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { SOURCES, TYPES } from "@/types/analytics";

interface AnalyticsFilters {
  startDate: string;
  endDate: string;
  source: string;
  domain: string;
  type: string;
  agentId: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface AnalyticsFiltersProps {
  filters: AnalyticsFilters;
  onFiltersChange: (filters: AnalyticsFilters) => void;
  agents: AgentProfile[];
  domains: string[];
  onClearFilters: () => void;
  isLoading?: boolean;
  userRole?: string;
}

export default function AnalyticsFilters({
  filters,
  onFiltersChange,
  agents,
  domains,
  onClearFilters,
  isLoading = false,
  userRole = "AGENT",
}: AnalyticsFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localDomain, setLocalDomain] = useState(filters.domain);

  const debouncedDomain = useDebounce(localDomain, 500);

  useEffect(() => {
    if (debouncedDomain !== filters.domain) {
      onFiltersChange({ ...filters, domain: debouncedDomain });
    }
  }, [debouncedDomain, filters, onFiltersChange]);

  useEffect(() => {
    setLocalDomain(filters.domain);
  }, [filters.domain]);

  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    if (filters.startDate && filters.endDate) {
      return {
        from: new Date(filters.startDate),
        to: new Date(filters.endDate),
      };
    }
    return undefined;
  });

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
  }, [dateRange, filters, onFiltersChange]);

  const handleInputChange = (field: keyof AnalyticsFilters, value: string | "asc" | "desc") => {
    if (field === "domain") {
      setLocalDomain(value);
    } else {
      onFiltersChange({ ...filters, [field]: value });
    }
  };

  const clearFilter = (field: keyof AnalyticsFilters) => {
    if (field === "startDate" || field === "endDate") {
      setDateRange(undefined);
      onFiltersChange({ ...filters, startDate: "", endDate: "" });
    } else {
      onFiltersChange({ ...filters, [field]: "" });
    }
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== "" && value !== "asc"
  );

  const isAgent = userRole === "AGENT";

  const getDateRangeDisplay = () => {
    if (dateRange?.from && dateRange?.to) {
      return `${format(dateRange.from, "MMM dd")} - ${format(dateRange.to, "MMM dd")}`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="gap-2"
            >
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">
                {getDateRangeDisplay() || "Date Range"}
              </span>
              <span className="sm:hidden">
                {getDateRangeDisplay() || "Dates"}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={setDateRange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        <Select
          value={filters.source || "all"}
          onValueChange={(value) => handleInputChange("source", value === "all" ? "" : value)}
        >
          <SelectTrigger className="w-auto">
            <SelectValue placeholder="All Sources" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sources</SelectItem>
            {SOURCES.map((source) => (
              <SelectItem key={source} value={source}>
                {source.charAt(0).toUpperCase() + source.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {domains.length > 0 ? (
          <Select
            value={filters.domain || "all"}
            onValueChange={(value) => handleInputChange("domain", value === "all" ? "" : value)}
          >
            <SelectTrigger className="w-auto">
              <SelectValue placeholder="All Domains" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Domains</SelectItem>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            placeholder="Filter by domain..."
            value={localDomain}
            onChange={(e) => handleInputChange("domain", e.target.value)}
            className="w-32"
          />
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "transition-all duration-200",
            isExpanded
              ? "bg-primary text-primary-foreground border-primary"
              : ""
          )}
          title="More filters"
        >
          <Settings2 className="h-4 w-4" />
        </Button>

        {hasActiveFilters && (
          <Button variant="outline" size="icon" onClick={onClearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Active Filter Pills */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {dateRange?.from && dateRange?.to && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
              <span>📅 {getDateRangeDisplay()}</span>
              <button
                onClick={() => clearFilter("startDate")}
                className="hover:text-blue-900 font-bold"
              >
                ×
              </button>
            </div>
          )}
          {filters.source && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
              <span>Source: {filters.source}</span>
              <button
                onClick={() => clearFilter("source")}
                className="hover:text-green-900 font-bold"
              >
                ×
              </button>
            </div>
          )}
          {filters.domain && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
              <span>Domain: {filters.domain}</span>
              <button
                onClick={() => clearFilter("domain")}
                className="hover:text-purple-900 font-bold"
              >
                ×
              </button>
            </div>
          )}
          {filters.type && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
              <span>Type: {filters.type}</span>
              <button
                onClick={() => clearFilter("type")}
                className="hover:text-orange-900 font-bold"
              >
                ×
              </button>
            </div>
          )}
          {filters.agentId && (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
              <span>Agent: {agents.find(a => a.userId === filters.agentId)?.user.firstName || filters.agentId}</span>
              <button
                onClick={() => clearFilter("agentId")}
                className="hover:text-red-900 font-bold"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}

      {/* Advanced Filters - Collapsible */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-2">
            <label className="text-sm font-medium">Analytics Type</label>
            <Select
              value={filters.type || "all"}
              onValueChange={(value) => handleInputChange("type", value === "all" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!isAgent && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent</label>
              <Select
                value={filters.agentId || "all"}
                onValueChange={(value) => handleInputChange("agentId", value === "all" ? "" : value)}
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
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort By</label>
            <Select
              value={filters.sortBy || "none"}
              onValueChange={(value) => handleInputChange("sortBy", value === "none" ? "" : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="chats">Chats</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="conversionRate">Conversion Rate</SelectItem>
                <SelectItem value="domain">Domain</SelectItem>
                <SelectItem value="source">Source</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Sort Order</label>
            <Select
              value={filters.sortOrder}
              onValueChange={(value) =>
                handleInputChange("sortOrder", value as "asc" | "desc")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
