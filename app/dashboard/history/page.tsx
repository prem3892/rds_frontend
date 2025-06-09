// src/app/(dashboard)/history/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useCurrentUser } from "@/stores/auth";
import { useGetAllChatSessions, useGetChatMessages } from "@/lib/api";
import {
  ChatSession,
  GetChatSessionsQueryDto,
  ChatSessionStatus,
  ChatMessage,
} from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow, // ... other imports
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { MessageCircle, Filter, HistoryIcon } from "lucide-react";
// REMOVE: import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const historyStatusOptions: ChatSessionStatus[] = [
  "RESOLVED",
  "CLOSED_BY_AGENT",
  "CLOSED_BY_CUSTOMER",
  "ABANDONED_BY_CUSTOMER",
  "ABANDONED_BY_AGENT",
  "EXPIRED_PENDING_ASSIGNMENT",
  "OFFLINE_MESSAGE",
];

export default function ChatHistoryPage() {
  const currentUser = useCurrentUser();
  const [filters, setFilters] = useState<
    Omit<GetChatSessionsQueryDto, "limit" | "page">
  >({
    status: currentUser?.role === "AGENT" ? undefined : "RESOLVED",
  });
  const [selectedSessionForMessages, setSelectedSessionForMessages] =
    useState<ChatSession | null>(null);

  useEffect(() => {
    if (currentUser?.role === "AGENT") {
      setFilters((prev) => ({
        ...prev,
        agentId: currentUser.id,
        status: prev.status || "RESOLVED",
      }));
    }
  }, [currentUser]);

  const {
    data: sessions,
    isLoading,
    error,
    refetch,
  } = useGetAllChatSessions(filters, {
    // sessions is ChatSession[]
    enabled: !!currentUser,
  });

  const { data: messages, isLoading: isLoadingMessages } = useGetChatMessages(
    selectedSessionForMessages?._id || null
  );

  // Explicitly type messages to avoid TypeScript inference issues
  const typedMessages: ChatMessage[] = messages || [];

  const handleFilterChange = (
    key: keyof Omit<GetChatSessionsQueryDto, "limit" | "page">,
    value: string | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center">
          <HistoryIcon className="mr-3 h-8 w-8" />
          Chat History
        </h1>
      </div>

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" /> Filter History
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Filter inputs remain similar */}
          <Select
            onValueChange={(value) =>
              handleFilterChange(
                "status",
                value === "ALL" ? undefined : (value as ChatSessionStatus)
              )
            }
            defaultValue={filters.status}
          >
            <SelectTrigger>
              <SelectValue placeholder="Status (Default: Closed)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All My Historical</SelectItem>
              {historyStatusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentUser?.role === "ADMIN" && (
            <Select
              onValueChange={(value) =>
                handleFilterChange(
                  "agentId",
                  value === "ALL_AGENTS" ? undefined : value
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by Agent (Admin)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_AGENTS">All Agents</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button onClick={() => refetch()} className="w-full md:col-span-2">
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {isLoading && <p>Loading history...</p>}
      {error && (
        <p className="text-red-500">Error loading history: {error.message}</p>
      )}

      {sessions && (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                {/* Table structure remains the same */}
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>Customer</TableHead>
                    {currentUser?.role === "ADMIN" && (
                      <TableHead>Agent</TableHead>
                    )}
                    <TableHead>Status</TableHead>
                    <TableHead>Ended At</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((session) => (
                    <TableRow key={session._id}>
                      <TableCell>{session._id.slice(-8)}</TableCell>
                      <TableCell>
                        {typeof session.customerId === "object" &&
                        session.customerId?.firstName
                          ? session.customerId.firstName
                          : typeof session.customerId === "string"
                          ? session.customerId.slice(-6)
                          : ""}
                      </TableCell>
                      {currentUser?.role === "ADMIN" && (
                        <TableCell>
                          {session.agent?.firstName ||
                            session.agentId?.slice(-6) ||
                            "N/A"}
                        </TableCell>
                      )}
                      <TableCell>
                        <Badge variant="secondary">
                          {session.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(parseISO(session.updatedAt), "PPp")}
                      </TableCell>
                      <TableCell>
                        {format(parseISO(session.createdAt), "PPp")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedSessionForMessages(session)
                              }
                            >
                              <MessageCircle className="h-4 w-4 mr-2" /> View
                              Messages
                            </Button>
                          </DialogTrigger>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={currentUser?.role === "ADMIN" ? 7 : 6}
                        className="text-center"
                      >
                        No chat history found for the selected filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          {/* REMOVE PaginationControls */}
        </>
      )}

      {selectedSessionForMessages && (
        <Dialog
          open={!!selectedSessionForMessages}
          onOpenChange={(isOpen) =>
            !isOpen && setSelectedSessionForMessages(null)
          }
        >
          <DialogContent className="max-w-2xl h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>
                Messages for Session: {selectedSessionForMessages._id.slice(-8)}
              </DialogTitle>
            </DialogHeader>
            <ScrollArea
              className="flex-1 p-4 border rounded-md my-2"
              id="messages-scroll-area-history"
            >
              {isLoadingMessages && typedMessages.length === 0 && (
                <p>Loading messages...</p>
              )}
              {typedMessages.map((msg: ChatMessage) => (
                <div
                  key={msg._id}
                  className={`mb-3 p-3 rounded-lg max-w-[75%] ${
                    msg.senderType === "AGENT" || msg.senderType === "SYSTEM"
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted mr-auto"
                  }`}
                >
                  <p className="text-xs font-semibold mb-1">
                    {msg.senderType === "SYSTEM"
                      ? "System"
                      : msg.senderId.slice(-6)}{" "}
                    ({msg.senderType})
                  </p>
                  <p className="text-sm">
                    {msg.content.text || JSON.stringify(msg.content)}
                  </p>
                  <p className="text-xs text-right mt-1 opacity-75">
                    {format(parseISO(msg.timestamp), "p")}
                  </p>
                </div>
              ))}
              {/* REMOVE Load Older Messages button */}
              {!isLoadingMessages && typedMessages.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No messages in this session.
                </p>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
  );
}
