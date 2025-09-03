"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface AgentFilters {
  search: string;
  department: string;
  status: string;
}

interface SearchFiltersProps {
  filters: AgentFilters;
  onFiltersChange: (filters: AgentFilters) => void;
  departments: { _id: string; name: string }[];
}

const SearchFilters = ({ filters, onFiltersChange, departments }: SearchFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleDepartmentChange = (value: string) => {
    onFiltersChange({ ...filters, department: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, status: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      department: "all",
      status: "all",
    });
  };

  const hasActiveFilters = filters.search || (filters.department && filters.department !== "all") || (filters.status && filters.status !== "all");

  return (
    <div className="space-y-3 sm:space-y-4 w-full overflow-hidden">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full">
        <div className="relative flex-1 w-full min-w-0">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search agents by name or email..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "transition-all duration-200 flex-1 sm:flex-none",
              isExpanded 
                ? "bg-primary text-primary-foreground border-primary shadow-md"  : ""
            )}
          >
            <Filter className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Filters</span>
            <span className="sm:hidden">Filter</span>
          </Button>
          {hasActiveFilters && (
            <Button variant="outline" size="icon" onClick={clearFilters} className="flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
          {/* Department Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Department</label>
            <Select value={filters.department} onValueChange={handleDepartmentChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept._id} value={dept._id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
