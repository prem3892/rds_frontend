"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ApiErrorResponse } from "@/types";
import { PaginatedCannedMessageResponse } from "@/types/canned-message";
import { CannedMessage } from "@/types/canned-message";
import { Row } from "@tanstack/react-table";
import { Globe, MessageSquare, Tag, User, Users } from "lucide-react";
import { columns } from "./canned-message-columns";
import CellAction from "./cell-actions";
import { CannedMessageDataTable } from "./canned-message-data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Department } from "@/types/department";

type Props = {
  messageData: PaginatedCannedMessageResponse | null;
  isLoadingMessages: boolean;
  messagesError: ApiErrorResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
};

// Canned Message Card Component for mobile view
const CannedMessageCard = ({ message }: { message: CannedMessage }) => {
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

            {/* Content Preview */}
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Content
                </span>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {message.content}
                </p>
              </div>
            </div>

            {/* Visibility */}
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-gray-500 flex-shrink-0" />
              <Badge
                variant={message.isGlobal ? "default" : "secondary"}
                className="text-xs"
              >
                {message.isGlobal ? "Global" : "Personal"}
              </Badge>
            </div>

            {/* Creator */}
            <div className="flex items-center gap-2">
              <User className="size-4 text-gray-500 flex-shrink-0" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Created by
                </span>
                <p className="text-sm text-gray-700">
                  {message.agentId.firstName} {message.agentId.lastName}
                </p>
              </div>
            </div>

            {/* Departments */}
            <div className="flex items-start gap-2">
              <Users className="size-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Departments
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.departmentIds.length > 0 ? (
                    message.departmentIds.map((dept: any, index: number | string) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {dept.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">
                      All departments
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-start gap-2">
              <Tag className="size-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Tags
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {message.tags.length > 0 ? (
                    message.tags.map((tag: string, index: number | string) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ml-3 flex-shrink-0">
            <CellAction row={{ original: message } as Row<CannedMessage>} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CannedMessageTable = (props: Props) => {
  const { 
    messageData, 
    isLoadingMessages, 
    messagesError, 
    currentPage, 
    onPageChange 
  } = props;
  
  const messages = messageData?.items || [];
  const meta = messageData?.meta;

  if (messagesError) {
    return (
      <div className="bg-white p-4 rounded-xl">
        <div className="text-center text-red-600 py-8">
          Error: {messagesError.message}
        </div>
      </div>
    );
  }

  if (!messages.length && !isLoadingMessages) {
    return (
      <div className="bg-white p-4 rounded-xl">
        <div className="text-center text-gray-500 py-8">
          No canned messages found
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl mt-4">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {isLoadingMessages ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      {/* Message Title */}
                      <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>

                      {/* Content */}
                      <div className="flex items-start gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-16"></div>
                          <div className="h-3 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>

                      {/* Visibility */}
                      <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded"></div>
                        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                      </div>

                      {/* Creator */}
                      <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
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

                      {/* Tags */}
                      <div className="flex items-start gap-2">
                        <div className="size-4 bg-gray-200 rounded mt-0.5"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-8"></div>
                          <div className="flex gap-1">
                            <div className="h-5 bg-gray-200 rounded-full w-12"></div>
                            <div className="h-5 bg-gray-200 rounded-full w-14"></div>
                          </div>
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
            {messages.map((message: CannedMessage, index: number | string) => (
              <CannedMessageCard key={message._id} message={message} />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <CannedMessageDataTable
          columns={columns}
          data={messages || []}
          isLoading={isLoadingMessages}
          skeletonRows={8}
        />
      </div>

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <PaginationControls
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CannedMessageTable;
