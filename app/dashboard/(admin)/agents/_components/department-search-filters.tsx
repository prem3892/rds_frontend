"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface DepartmentFilters {
  search: string;
}

interface DepartmentSearchFiltersProps {
  filters: DepartmentFilters;
  onFiltersChange: (filters: DepartmentFilters) => void;
}

export default function DepartmentSearchFilters({
  filters,
  onFiltersChange,
}: DepartmentSearchFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search by department name"
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
    </div>
  );
}
