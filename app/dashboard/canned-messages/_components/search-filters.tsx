"use client";

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CannedMessageFilters } from "@/types/canned-message";
import debounce from "lodash/debounce";
import { cn } from "@/lib/utils";

interface SearchFiltersProps {
  filters: CannedMessageFilters;
  onFiltersChange: (filters: CannedMessageFilters) => void;
  availableTags: string[];
  availableDepartments: Array<{ _id: string; name: string }>;
}

export default function SearchFilters({
  filters,
  onFiltersChange,
  availableTags,
  availableDepartments,
}: SearchFiltersProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
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

  const handleTagToggle = (tag: string) => {
    const currentTags = filters.tags ? filters.tags.split(",").filter( (t: string) => t.trim()) : [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t: string) => t !== tag)
      : [...currentTags, tag];
    
    onFiltersChange({
      ...filters,
      tags: newTags.length > 0 ? newTags.join(",") : undefined,
      page: 1,
    });
  };

  const handleDepartmentToggle = (deptId: string) => {
    const currentDepts = filters.departmentIds ? filters.departmentIds.split(",").filter((d: string) => d.trim()) : [];
    const newDepts = currentDepts.includes(deptId)
      ? currentDepts.filter((d: string) => d !== deptId)
      : [...currentDepts, deptId];
    
    onFiltersChange({
      ...filters,
      departmentIds: newDepts.length > 0 ? newDepts.join(",") : undefined,
      page: 1,
    });
  };

  const handleVisibilityChange = (isGlobal: boolean | undefined) => {
    onFiltersChange({
      ...filters,
      isGlobal: isGlobal,
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

  const hasActiveFilters = filters.search || filters.tags || filters.departmentIds || filters.isGlobal !== undefined;

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className={cn(
          "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
          isSearching ? "text-blue-500 animate-pulse" : "text-gray-400"
        )} />
        <Input
          placeholder="Search messages..."
          value={searchValue}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Button */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 text-xs">
                {[
                  filters.search ? 1 : 0,
                  filters.tags ? filters.tags.split(",").length : 0,
                  filters.departmentIds ? filters.departmentIds.split(",").length : 0,
                  filters.isGlobal !== undefined ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            {/* Visibility Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Visibility</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="all-visibility"
                    checked={filters.isGlobal === undefined}
                    onCheckedChange={() => handleVisibilityChange(undefined)}
                  />
                  <Label htmlFor="all-visibility" className="text-sm">All messages</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="global-only"
                    checked={filters.isGlobal === true}
                    onCheckedChange={() => handleVisibilityChange(true)}
                  />
                  <Label htmlFor="global-only" className="text-sm">Global only</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="personal-only"
                    checked={filters.isGlobal === false}
                    onCheckedChange={() => handleVisibilityChange(false)}
                  />
                  <Label htmlFor="personal-only" className="text-sm">Personal only</Label>
                </div>
              </div>
            </div>

            {/* Tags Filter */}
            {availableTags.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tags</Label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableTags.map((tag: string) => {
                    const isSelected = filters.tags?.includes(tag) || false;
                    return (
                      <Badge
                        key={tag}
                        variant={isSelected ? "default" : "outline"}
                        className="cursor-pointer hover:bg-primary/80"
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                        {isSelected && <X className="ml-1 h-3 w-3" />}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Departments Filter */}
            {availableDepartments.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Departments</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableDepartments.map((dept) => {
                    const isSelected = filters.departmentIds?.includes(dept._id) || false;
                    return (
                      <div key={dept._id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`dept-${dept._id}`}
                          checked={isSelected}
                          onCheckedChange={() => handleDepartmentToggle(dept._id)}
                        />
                        <Label htmlFor={`dept-${dept._id}`} className="text-sm">{dept.name}</Label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
