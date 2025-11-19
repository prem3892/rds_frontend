"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsItem, AnalyticsMeta } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface AnalyticsTableProps {
  items: AnalyticsItem[] | undefined;
  meta: AnalyticsMeta | undefined;
  isLoading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
}

const exportToCSV = (items: AnalyticsItem[] | undefined) => {
  if (!items || items.length === 0) return;

  const headers = ["Agent Name", "Source", "Domain", "Date"];
  const csvData = items.map((item) => [
    item.agentName || "Unassigned",
    item.source,
    item.domain,
    format(new Date(item.createdAt), "MMM dd, yyyy HH:mm"),
  ]);

  const csvContent = [
    headers.join(","),
    ...csvData.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `analytics-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function AnalyticsTable({
  items,
  meta,
  isLoading,
  currentPage,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: AnalyticsTableProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat Analytics Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!items || items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Chat Analytics Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No analytics data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      organic: "bg-blue-100 text-blue-800",
      gad: "bg-green-100 text-green-800",
      meta: "bg-purple-100 text-purple-800",
      chatgpt: "bg-orange-100 text-orange-800",
    };
    return colors[source.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Chat Analytics Details</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportToCSV(items)}
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
          <span className="sm:hidden">Export</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-white">
              <TableRow>
                <TableHead>Agent Name</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.chatSessionId}>
                  <TableCell>
                    {item.agentName || "Unassigned"}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getSourceColor(item.source)}`}>
                      {item.source}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {item.domain}
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(item.createdAt), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && (
          <div className="mt-4 sm:mt-6">
            <PaginationControls
              currentPage={currentPage}
              totalPages={meta.totalPages}
              onPageChange={onPageChange}
              pageSize={pageSize}
              onPageSizeChange={onPageSizeChange}
              alwaysShow
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
