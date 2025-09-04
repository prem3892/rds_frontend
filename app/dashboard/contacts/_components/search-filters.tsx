"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { ContactFilters } from "@/types/contact";
import debounce from "lodash/debounce";
import { Filter, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface SearchFiltersProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
}: SearchFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || "");
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      onFiltersChange({ ...filters, search: value, page: 1 });
      setIsSearching(false);
    }, 300),
    [filters, onFiltersChange]
  );

  // Update local search value when filters change externally
  useEffect(() => {
    setSearchValue(filters.search || "");
  }, [filters.search]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setIsSearching(true);
    debouncedSearch(value);
  };

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as "createdAt" | "updatedAt" | "firstName" | "lastName" | "email",
      page: 1,
    });
  };

  const handleSortOrderChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortOrder: value as "asc" | "desc",
      page: 1,
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  const hasActiveFilters = filters.search;

  return (
    <div className="space-y-4">
      {/* Search Bar and Toggle */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-md">
          <Search className={cn(
            "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
            isSearching ? "text-blue-500 animate-pulse" : "text-gray-400"
          )} />
          <Input
            placeholder="Search contacts..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>  
        <Button
          variant="outline"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "transition-all duration-200",
            isExpanded 
              ? "bg-primary text-primary-foreground border-primary shadow-md" : ""
          )}
        >
          <Filter className="h-4 w-4" /> Filters
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50 rounded-lg">
          {/* Sort By Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Sort By</Label>
            <Select value={filters.sortBy} onValueChange={handleSortByChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="updatedAt">Updated Date</SelectItem>
                <SelectItem value="firstName">First Name</SelectItem>
                <SelectItem value="lastName">Last Name</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Sort Order</Label>
            <Select value={filters.sortOrder} onValueChange={handleSortOrderChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sort Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Descending</SelectItem>
                <SelectItem value="asc">Ascending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
