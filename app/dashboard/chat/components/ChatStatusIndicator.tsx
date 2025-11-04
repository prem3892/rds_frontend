import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock, UserX, CheckCircle, XCircle, Wifi, WifiOff } from "lucide-react";
import { ChatSessionStatus } from "@/types";

interface ChatStatusIndicatorProps {
  status: ChatSessionStatus;
  className?: string;
}

const ChatStatusIndicator = ({ status, className = "" }: ChatStatusIndicatorProps) => {
  const getStatusConfig = (status: ChatSessionStatus) => {
    switch (status) {
      case "ACTIVE":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Active",
          variant: "default" as const,
          className: "bg-green-100 text-green-800 border-green-200",
        };
      case "PENDING_ASSIGNMENT":
        return {
          icon: <Clock className="h-3 w-3" />,
          label: "Waiting for Agent",
          variant: "outline" as const,
          className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        };
      case "PENDING_AGENT_RECONNECT":
        return {
          icon: <WifiOff className="h-3 w-3" />,
          label: "Agent Disconnected",
          variant: "outline" as const,
          className: "bg-orange-100 text-orange-800 border-orange-200",
        };
      case "ABANDONED_BY_AGENT":
        return {
          icon: <UserX className="h-3 w-3" />,
          label: "Abandoned by Agent",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 border-red-200",
        };
      case "ABANDONED_BY_CUSTOMER":
        return {
          icon: <UserX className="h-3 w-3" />,
          label: "Customer Disconnected",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      case "CLOSED_BY_AGENT":
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: "Closed by Agent",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      case "CLOSED_BY_CUSTOMER":
        return {
          icon: <XCircle className="h-3 w-3" />,
          label: "Closed by Customer",
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
      case "RESOLVED":
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: "Resolved",
          variant: "default" as const,
          className: "bg-blue-100 text-blue-800 border-blue-200",
        };
      case "OFFLINE_MESSAGE":
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: "Offline Message",
          variant: "outline" as const,
          className: "bg-purple-100 text-purple-800 border-purple-200",
        };
      default:
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: status.replace(/_/g, " "),
          variant: "outline" as const,
          className: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={`text-xs py-0 px-2 h-5 flex items-center gap-1 ${config.className} ${className}`}
    >
      {config.icon}
      <span className="hidden sm:inline">{config.label}</span>
      <span className="sm:hidden">{config.label.split(' ')[0]}</span>
    </Badge>
  );
};

export default ChatStatusIndicator;
