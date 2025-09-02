"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PaginationControls } from "@/components/ui/pagination-controls";
  import { ApiErrorResponse } from "@/types";
import { PaginatedAutoMessageResponse } from "@/types/auto-message";
import { AutoMessage } from "@/types/auto-message";
import { Widget } from "@/types/widget";
import { Clock, Edit, Globe, MapPin, MessageSquare, Settings, Tag, Trash2 } from "lucide-react";
import { useState } from "react";
import { createColumns } from "./auto-message-columns";
import { AutoMessageDataTable } from "./auto-message-data-table";
import DeleteAutoMessageDialog from "./delete-auto-message-dialog";
import EditAutoMessageDialog from "./edit-auto-message-dialog";

type Props = {
  messageData: PaginatedAutoMessageResponse | null;
  isLoadingMessages: boolean;
  messagesError: ApiErrorResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  widgets: Widget[];
};

// Auto Message Card Component for mobile view
const AutoMessageCard = ({ message, widgets }: { message: AutoMessage; widgets: Widget[] }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-3">
            {/* Message Title */}
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-blue-500 flex-shrink-0" />
              <span className="font-semibold text-sm text-gray-900">
                {message.title}
              </span>
            </div>

            {/* Message Content */}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Message
                </span>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {message.message}
                </p>
              </div>
            </div>

            {/* Domain */}
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Domain
                </span>
                <p className="text-sm text-gray-700">
                  {message.domain}
                </p>
              </div>
            </div>

            {/* Scope */}
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-gray-500 flex-shrink-0" />
              <Badge
                variant={message.sitewide ? "default" : "secondary"}
                className="text-xs"
              >
                {message.sitewide ? "Sitewide" : "Page-specific"}
              </Badge>
            </div>

            {/* Page Paths */}
            {!message.sitewide && message.pagePaths.length > 0 && (
              <div className="flex items-start gap-2">
                <Tag className="size-4 text-gray-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    Page Paths
                  </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {message.pagePaths.map((path: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {path}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Show After */}
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Show After
                </span>
                <p className="text-sm text-gray-700">
                  {message.showAfterSeconds} seconds
                </p>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2">
              <Settings className="size-4 text-gray-500 flex-shrink-0" />
              <Badge
                variant={message.isEnabled ? "default" : "secondary"}
                className="text-xs"
              >
                {message.isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="flex-1 h-8 text-xs"
              >
                <Edit className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
                className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <EditAutoMessageDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        autoMessage={message}
        widgets={widgets}
      />

      {/* Delete Dialog */}
      <DeleteAutoMessageDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        autoMessage={message}
      />
    </Card>
  );
};

export default function AutoMessageTable({
  messageData,
  isLoadingMessages,
  messagesError,
  currentPage,
  onPageChange,
  widgets,
}: Props) {
  if (isLoadingMessages) {
    return (
      <div className="mx-4">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (messagesError) {
    return (
      <div className="mx-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600">
              <p className="font-medium">Error loading auto messages</p>
              <p className="text-sm mt-1">
                {typeof messagesError.message === "string"
                  ? messagesError.message
                  : "An unexpected error occurred"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!messageData || messageData.items.length === 0) {
    return (
      <div className="mx-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-gray-500">
              <MessageSquare className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">No auto messages found</p>
              <p className="text-sm mt-1">
                Create your first auto message to get started
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-4">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <AutoMessageDataTable
          columns={createColumns(widgets)}
          data={messageData.items}
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        {messageData.items.map((message: AutoMessage) => (
          <AutoMessageCard key={message._id} message={message} widgets={widgets} />
        ))}
      </div>

      {/* Pagination */}
      {messageData.meta.totalPages > 1 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={messageData.meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
