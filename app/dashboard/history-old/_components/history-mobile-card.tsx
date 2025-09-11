"use client";

import { ChatSession } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, User, Building2, Globe, Calendar, MessageSquare } from "lucide-react";
import { format, parseISO } from "date-fns";

interface HistoryMobileCardProps {
  session: ChatSession;
  onViewMessages: (session: ChatSession) => void;
}

export default function HistoryMobileCard({
  session,
  onViewMessages,
}: HistoryMobileCardProps) {
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

  const widgetName = typeof session.widgetId === "object" ? session.widgetId?.name : "N/A";
  const customerName = typeof session.customerId === "object" ? session.customerId?.name : "N/A";
  const customerEmail = typeof session.customerId === "object" ? session.customerId?.email : "N/A";
  const agentName = `${session.agentId.firstName} ${session.agentId.lastName}`;
  const agentEmail = session.agentId.email;
  const departmentName = session.departmentId.name;
  const lastMessageAt = session.lastMessageAt ? parseISO(session.lastMessageAt) : null;

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Widget and Status Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">{widgetName}</span>
            </div>
            <Badge variant={getStatusVariant(session.status)}>
              {session.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Customer Information */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Customer</span>
              <div className="mt-1">
                <div className="font-medium text-sm">{customerName}</div>
                <div className="text-xs text-gray-500">{customerEmail}</div>
              </div>
            </div>
          </div>

          {/* Agent Information */}
          <div className="flex items-start gap-2">
            <User className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Agent</span>
              <div className="mt-1">
                <div className="font-medium text-sm">{agentName}</div>
                <div className="text-xs text-gray-500">{agentEmail}</div>
              </div>
            </div>
          </div>

          {/* Department Information */}
          <div className="flex items-start gap-2">
            <Building2 className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Department</span>
              <div className="mt-1">
                <div className="font-medium text-sm">{departmentName}</div>
              </div>
            </div>
          </div>

          {/* Initial Message */}
          <div className="flex items-start gap-2">
            <MessageSquare className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Initial Message</span>
              <div className="mt-1">
                <div className="text-sm text-gray-700 line-clamp-2">
                  {session.initialMessage || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Last Activity */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Last Activity</span>
              <div className="mt-1">
                <div className="text-sm text-gray-700">
                  {lastMessageAt ? format(lastMessageAt, "MMM dd, yyyy 'at' HH:mm") : "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewMessages(session)}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              View Messages
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
