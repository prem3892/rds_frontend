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
import { BlockedCustomerFilters } from "@/types/blocked-customer";
import debounce from "lodash/debounce";
import { Filter, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface SearchFiltersProps {
  filters: BlockedCustomerFilters;
  onFiltersChange: (filters: BlockedCustomerFilters) => void;
  availableDomains: string[];
  availableWidgets: string[];
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  availableDomains,
  availableWidgets,
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

  const handleDomainToggle = (domain: string) => {
    const currentDomains = filters.domain ? filters.domain.split(",").filter(d => d.trim()) : [];
    const newDomains = currentDomains.includes(domain)
      ? currentDomains.filter(d => d !== domain)
      : [...currentDomains, domain];
    
    onFiltersChange({
      ...filters,
      domain: newDomains.length > 0 ? newDomains.join(",") : undefined,
      page: 1,
    });
  };

  const handleWidgetToggle = (widgetName: string) => {
    const currentWidgets = filters.widgetName ? filters.widgetName.split(",").filter(w => w.trim()) : [];
    const newWidgets = currentWidgets.includes(widgetName)
      ? currentWidgets.filter(w => w !== widgetName)
      : [...currentWidgets, widgetName];
    
    onFiltersChange({
      ...filters,
      widgetName: newWidgets.length > 0 ? newWidgets.join(",") : undefined,
      page: 1,
    });
  };

  const handleSortByChange = (value: string) => {
    onFiltersChange({
      ...filters,
      sortBy: value as "blockedAt" | "createdAt" | "name" | "email",
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

  const hasActiveFilters = filters.search || filters.domain || filters.widgetName;

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
            placeholder="Search blocked customers..."
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
                <SelectItem value="blockedAt">Blocked Date</SelectItem>
                <SelectItem value="createdAt">Created Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
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

          {/* Widgets Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Widget</Label>
            {availableWidgets.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableWidgets.map((widgetName) => {
                  const isSelected = filters.widgetName?.includes(widgetName) || false;
                  return (
                    <Badge
                      key={widgetName}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 text-xs"
                      onClick={() => handleWidgetToggle(widgetName)}
                    >
                      {widgetName}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No widgets available</div>
            )}
          </div>

          {/* Domains Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Domains</Label>
            {availableDomains.length > 0 ? (
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableDomains.map((domain) => {
                  const isSelected = filters.domain?.includes(domain) || false;
                  return (
                    <Badge
                      key={domain}
                      variant={isSelected ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80 text-xs"
                      onClick={() => handleDomainToggle(domain)}
                    >
                      {domain}
                      {isSelected && <X className="ml-1 h-3 w-3" />}
                    </Badge>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">No domains available</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
