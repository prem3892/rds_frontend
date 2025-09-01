"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ChatSession } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Building2, Globe } from "lucide-react";
import { format, parseISO } from "date-fns";

interface HistoryColumnsProps {
  onViewMessages: (session: ChatSession) => void;
}

export const createHistoryColumns = (
  onViewMessages: (session: ChatSession) => void
): ColumnDef<ChatSession>[] => [
  {
    accessorKey: "widgetId",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4" />
          <span>Widget</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original;
      const widgetName = typeof session.widgetId === "object" ? session.widgetId?.name : "N/A";
      
      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{widgetName}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "customerId",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>Customer</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original;
      const customerName = typeof session.customerId === "object" ? session.customerId?.name : "N/A";
      const customerEmail = typeof session.customerId === "object" ? session.customerId?.email : "N/A";
      
      return (
        <div className="space-y-1">
          <div className="font-medium">{customerName}</div>
          <div className="text-sm text-gray-500">{customerEmail}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "agentId",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>Agent</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original;
      const agentName = `${session.agentId.firstName} ${session.agentId.lastName}`;
      const agentEmail = session.agentId.email;
      
      return (
        <div className="space-y-1">
          <div className="font-medium">{agentName}</div>
          <div className="text-sm text-gray-500">{agentEmail}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "departmentId",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <Building2 className="h-4 w-4" />
          <span>Department</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original;
      const departmentName = session.departmentId.name;
      
      return (
        <div className="font-medium">{departmentName}</div>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <span>Status</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original;
      const getStatusVariant = (status: string) => {
        switch (status) {
          case "RESOLVED":
            return "default";
          case "CLOSED_BY_AGENT":
          case "CLOSED_BY_CUSTOMER":
            return "secondary";
          case "ABANDONED_BY_CUSTOMER":
          case "ABANDONED_BY_AGENT":
            return "destructive";
          case "EXPIRED_PENDING_ASSIGNMENT":
            return "outline";
          default:
            return "secondary";
        }
      };
      
      return (
        <Badge variant={getStatusVariant(session.status)}>
          {session.status.replace(/_/g, " ")}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastMessageAt",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <span>Last Activity</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original;
      const lastMessageAt = session.lastMessageAt ? parseISO(session.lastMessageAt) : null;
      
      return (
        <div className="space-y-1">
          <div className="font-medium">
            {lastMessageAt ? format(lastMessageAt, "MMM dd") : "N/A"}
          </div>
          <div className="text-sm text-gray-500">
            {lastMessageAt ? format(lastMessageAt, "HH:mm") : ""}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "initialMessage",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <span>Initial Message</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div className="max-w-[200px] truncate text-sm text-gray-600">
          {session.initialMessage || "N/A"}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original;

      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onViewMessages(session)}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          View Message
        </Button>
      );
    },
  },
];
