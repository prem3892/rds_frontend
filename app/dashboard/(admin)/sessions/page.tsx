// src/app/(dashboard)/admin/sessions/page.tsx
"use client";
import { useState } from "react";
import { useCurrentUser } from "@/stores/auth";
import { useGetAllChatSessions, useGetChatMessages } from "@/lib/api";
import {
  ChatSession,
  GetChatSessionsQueryDto,
  ChatSessionStatus,
  ChatMessage,
} from "@/types"; // Omit PaginatedResponse for now
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
import {
  MessageCircle,
  Filter,
  Search,
  User as UserIcon,
  Building,
} from "lucide-react";
// REMOVE: import { PaginationControls } from "@/components/ui/pagination-controls";

const statusOptions: ChatSessionStatus[] = [
  "OPEN",
  "PENDING_ASSIGNMENT",
  "ACTIVE",
  "CLOSED",
  "ABANDONED_BY_CUSTOMER",
  "ABANDONED_BY_AGENT",
  "PENDING_AGENT_RECONNECT",
  "RESOLVED",
];

export default function AllChatSessionsPage() {
  const currentUser = useCurrentUser();
  // Filters no longer include page/limit for this simplified version
  const [filters, setFilters] = useState<
    Omit<GetChatSessionsQueryDto, "limit" | "page">
  >({});
  const [selectedSessionForMessages, setSelectedSessionForMessages] =
    useState<ChatSession | null>(null);

  // useGetAllChatSessions now returns ChatSession[] directly
  const {
    data: sessions,
    isLoading,
    error,
    refetch,
  } = useGetAllChatSessions(filters, {
    enabled: currentUser?.role === "ADMIN",
  });

  // useGetChatMessages now returns ChatMessage[] directly
  const {
    data: messages,
    isLoading: isLoadingMessages,
    // Removed infinite scroll related properties
  } = useGetChatMessages(selectedSessionForMessages?._id || null);

  const typedMessages = messages as ChatMessage[];

  const handleFilterChange = (
    key: keyof Omit<GetChatSessionsQueryDto, "limit" | "page">,
    value: string | undefined
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (currentUser?.role !== "ADMIN") {
    return (
      <p className="p-4">
        Access Denied. This page is for Administrators only.
      </p>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">All Chat Sessions</h1>
      </div>

      <Card className="p-4">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter inputs remain the same */}
          <Input
            placeholder="Customer Name"
            onChange={(e) =>
              handleFilterChange("customerName", e.target.value || undefined)
            }
          />
          <Input
            placeholder="Customer Email"
            onChange={(e) =>
              handleFilterChange("customerEmail", e.target.value || undefined)
            }
          />
          <Input
            placeholder="Agent ID"
            onChange={(e) =>
              handleFilterChange("agentId", e.target.value || undefined)
            }
          />
          <Input
            placeholder="Department ID"
            onChange={(e) =>
              handleFilterChange("departmentId", e.target.value || undefined)
            }
          />
          <Select
            onValueChange={(value) =>
              handleFilterChange(
                "status",
                (value as ChatSessionStatus) || undefined
              )
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {s.replace(/_/g, " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => refetch()}
            className="w-full lg:col-span-1 self-end"
          >
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {isLoading && <p>Loading sessions...</p>}
      {error && (
        <p className="text-red-500">Error loading sessions: {error.message}</p>
      )}

      {sessions && ( // sessions is now ChatSession[]
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map(
                    (
                      session // Iterate over sessions directly
                    ) => (
                      <TableRow key={session._id}>
                        <TableCell>
                          {session.customer?.firstName ||
                            session.customerId.slice(-6)}
                        </TableCell>
                        <TableCell>
                          {session.agent?.firstName ||
                            session.agentId?.slice(-6) ||
                            "N/A"}
                        </TableCell>
                        <TableCell>
                          {session.department?.name ||
                            session.departmentId?.slice(-6) ||
                            "N/A"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              session.status === "ACTIVE"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {session.status.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {session.lastMessageTimestamp
                            ? format(
                                parseISO(session.lastMessageTimestamp),
                                "PPpp"
                              )
                            : "N/A"}
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
                    )
                  )}
                  {sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        No sessions found for the selected filters.
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
              id="messages-scroll-area"
            >
              {isLoadingMessages &&
                (!typedMessages || typedMessages?.length === 0) && (
                  <p>Loading messages...</p>
                )}
              {typedMessages?.map(
                (
                  msg: ChatMessage // messages is now ChatMessage[]
                ) => (
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
                )
              )}
              {/* REMOVE Load Older Messages button */}
              {!isLoadingMessages && (!messages || messages.length === 0) && (
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
