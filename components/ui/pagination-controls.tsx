// src/components/ui/pagination-controls.tsx
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center space-x-2 py-4 overflow-hidden">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex-shrink-0"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </Button>
      <span className="text-sm flex-shrink-0">
        Page {currentPage} of {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex-shrink-0"
      >
        <span className="hidden sm:inline">Next</span>
        <span className="sm:hidden">Next</span>
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
