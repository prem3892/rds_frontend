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
import { AutoMessageFilters } from "@/types/auto-message";
import { Widget } from "@/types/widget";
import debounce from "lodash/debounce";
import { Filter, Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface SearchFiltersProps {
  filters: AutoMessageFilters;
  onFiltersChange: (filters: AutoMessageFilters) => void;
  availableDomains: string[];
  availableWidgets: Widget[];
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

  const handleWidgetToggle = (widgetId: string) => {
    const currentWidgets = filters.widgetId ? filters.widgetId.split(",").filter(w => w.trim()) : [];
    const newWidgets = currentWidgets.includes(widgetId)
      ? currentWidgets.filter(w => w !== widgetId)
      : [...currentWidgets, widgetId];
    
    onFiltersChange({
      ...filters,
      widgetId: newWidgets.length > 0 ? newWidgets.join(",") : undefined,
      page: 1,
    });
  };

  const handleStatusChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({
        ...filters,
        isEnabled: undefined,
        page: 1,
      });
    } else if (value === "enabled") {
      onFiltersChange({
        ...filters,
        isEnabled: true,
        page: 1,
      });
    } else if (value === "disabled") {
      onFiltersChange({
        ...filters,
        isEnabled: false,
        page: 1,
      });
    }
  };

  const handleScopeChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({
        ...filters,
        sitewide: undefined,
        page: 1,
      });
    } else if (value === "sitewide") {
      onFiltersChange({
        ...filters,
        sitewide: true,
        page: 1,
      });
    } else if (value === "page-specific") {
      onFiltersChange({
        ...filters,
        sitewide: false,
        page: 1,
      });
    }
  };

  const handleWidgetChange = (value: string) => {
    if (value === "all") {
      onFiltersChange({
        ...filters,
        widgetId: undefined,
        page: 1,
      });
    } else {
      const newWidgetId = value;
      const currentWidgets = filters.widgetId ? filters.widgetId.split(",").filter(w => w.trim()) : [];
      const newWidgets = currentWidgets.includes(newWidgetId)
        ? currentWidgets.filter(w => w !== newWidgetId)
        : [...currentWidgets, newWidgetId];
      
      onFiltersChange({
        ...filters,
        widgetId: newWidgets.length > 0 ? newWidgets.join(",") : undefined,
        page: 1,
      });
    }
  };

  const getStatusValue = () => {
    if (filters.isEnabled === undefined) return "all";
    if (filters.isEnabled === true) return "enabled";
    if (filters.isEnabled === false) return "disabled";
    return "all";
  };

  const getScopeValue = () => {
    if (filters.sitewide === undefined) return "all";
    if (filters.sitewide === true) return "sitewide";
    if (filters.sitewide === false) return "page-specific";
    return "all";
  };

  const getWidgetValue = () => {
    if (!filters.widgetId) return "all";
    return filters.widgetId;
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    });
  };

  const hasActiveFilters = filters.search || filters.domain || filters.widgetId || filters.isEnabled !== undefined || filters.sitewide !== undefined;

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
            placeholder="Search auto messages..."
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>  
        <Button
          variant="outline"

          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "transition-all duration-200 ",
            isExpanded 
              ? "bg-primary text-primary-foreground border-primary shadow-md"  : ""
          )}
        >
          <Filter className="h-4 w-4" />  Filters
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
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Status</Label>
            <Select value={getStatusValue()} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="enabled">Enabled only</SelectItem>
                <SelectItem value="disabled">Disabled only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Scope Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Scope</Label>
            <Select value={getScopeValue()} onValueChange={handleScopeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Scopes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scopes</SelectItem>
                <SelectItem value="sitewide">Sitewide only</SelectItem>
                <SelectItem value="page-specific">Page-specific only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Widgets Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Widget</Label>
            <Select value={getWidgetValue()} onValueChange={handleWidgetChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Widgets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Widgets</SelectItem>
                {availableWidgets.map((widget) => (
                  <SelectItem key={widget._id} value={widget._id}>
                    {widget.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
