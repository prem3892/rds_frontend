"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ApiErrorResponse, PaginatedWidgetResponse, Widget } from "@/types";
import { Row } from "@tanstack/react-table";
import {
  EllipsisVertical,
  Globe,
  IdCard,
  Paintbrush,
  Workflow,
} from "lucide-react";
import CelAction from "./cell-actions";
import { columns } from "./widget-columns";
import { Button } from "@/components/ui/button";

type Props = {
  widgetData: PaginatedWidgetResponse | null;
  isLoadingWidgets: boolean;
  widgetsError: ApiErrorResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
};

// Widget Card Component for mobile view
const WidgetCard = ({ widget }: { widget: Widget }) => {
  return (
    <Card className="mb-4 p-2 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start ">
          <div className="flex-1 space-y-1  ">
            <div className="flex items-center justify-between gap-2 ">
              {/* Widget Name */}
              <div className="flex items-center  gap-2">
                <IdCard className="size-4 text-blue-500 flex-shrink-0" />
                <span className="font-semibold text-sm text-gray-900">
                  {widget.name}
                </span>
              </div>
              <div className="ml-3 flex-shrink-0 items-end ">
                <CelAction row={{ original: widget } as Row<Widget>} />
              </div>
            </div>

            {/* Domains */}
            <div className="flex items-center  gap-2">
              <Globe className="size-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 flex-row">
                <span className="text-xs text-gray-500 uppercase  tracking-wide">
                  Domains
                </span>
                <div className="flex-1 flex-row flex-wrap">
                  <p className="text-sm text-gray-700">
                    {widget.domains.length > 0
                      ? widget.domains.join(", ")
                      : "All domains"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between ">
              {/* Primary Color */}
              <div className="flex items-center gap-2">
                <Paintbrush className="size-4 text-gray-500 flex-shrink-0" />
                <div className="flex items-center gap-2">
                  <span
                    className="size-4 rounded-full border border-gray-200"
                    style={{ backgroundColor: widget.primaryColor }}
                  ></span>
                  <Badge variant="outline" className="text-xs rounded-full">
                    {widget.primaryColor}
                  </Badge>
                </div>
              </div>

              {/* Departments */}
              <div className="flex items-center gap-2">
                <Workflow className="size-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-500  tracking-wide">
                    Departments
                  </span>
                  <div className="flex-1 flex-row flex-wrap">
                    {widget.departmentIds.length > 0 ? (
                      widget.departmentIds.map((dept, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {dept.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">
                        No departments assigned
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
        </div>
      </CardContent>
    </Card>
  );
};

const WidgetTable = (props: Props) => {
  const {
    widgetData,
    isLoadingWidgets,
    widgetsError,
    currentPage,
    onPageChange,
    pageSize,
    onPageSizeChange,
  } = props;
  const widgets = widgetData?.items || [];
  const meta = widgetData?.meta;

  if (widgetsError) {
    return (
      <div className="bg-white p-4 rounded-xl">
        <div className="text-center text-red-600 py-8">
          Error: {widgetsError.message}
        </div>
      </div>
    );
  }

  if (!widgets.length && !isLoadingWidgets) {
    return (
      <div className="bg-white p-4 rounded-xl">
        <div className="text-center text-gray-500 py-8">No apps found</div>
      </div>
    );
  }

  return (
    <div className="bg-white p-2 sm:p-4 rounded-xl mt-4">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {isLoadingWidgets ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      {/* Widget Name */}
                      <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>

                      {/* Domains */}
                      <div className="flex items-start gap-2">
                        <div className="size-4 bg-gray-200 rounded mt-0.5"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-40"></div>
                        </div>
                      </div>

                      {/* Primary Color */}
                      <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded"></div>
                        <div className="flex items-center gap-2">
                          <div className="size-4 bg-gray-200 rounded-full"></div>
                          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                        </div>
                      </div>

                      {/* Welcome Message */}
                      <div className="flex items-start gap-2">
                        <div className="size-4 bg-gray-200 rounded mt-0.5"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>

                      {/* Departments */}
                      <div className="flex items-start gap-2">
                        <div className="size-4 bg-gray-200 rounded mt-0.5"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="flex gap-1">
                            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                          </div>
                        </div>
                      </div>

                      {/* Header Text */}
                      <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-18"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-3">
                      <div className="size-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {widgets.map((widget) => (
              <WidgetCard key={widget._id} widget={widget} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={widgets || []}
          isLoading={isLoadingWidgets}
          skeletonRows={8}
        />
      </div>

      {/* Pagination Controls */}
      {meta && (
        <div className="mt-6">
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
    </div>
  );
};

export default WidgetTable;
