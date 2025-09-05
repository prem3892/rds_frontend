import React from "react";
import { AlertCircle, Clock, WifiOff, UserX, CheckCircle } from "lucide-react";
import { ChatSessionStatus } from "@/types";
import { motion, AnimatePresence } from "framer-motion";

interface ChatStatusBannerProps {
  status: ChatSessionStatus;
  agentName?: string;
  customerName?: string;
  className?: string;
}

const ChatStatusBanner = ({ 
  status, 
  agentName, 
  customerName, 
  className = "" 
}: ChatStatusBannerProps) => {
  const getStatusMessage = (status: ChatSessionStatus) => {
    switch (status) {
      case "PENDING_AGENT_RECONNECT":
        return {
          icon: <WifiOff className="h-4 w-4" />,
          message: "Agent disconnected. Waiting for reconnection...",
          type: "warning" as const,
          className: "bg-orange-50 border-orange-200 text-orange-800",
        };
      case "ABANDONED_BY_AGENT":
        return {
          icon: <UserX className="h-4 w-4" />,
          message: "Chat abandoned by agent. Customer may need assistance.",
          type: "error" as const,
          className: "bg-red-50 border-red-200 text-red-800",
        };
      case "ABANDONED_BY_CUSTOMER":
        return {
          icon: <UserX className="h-4 w-4" />,
          message: "Customer disconnected. They may return soon.",
          type: "info" as const,
          className: "bg-blue-50 border-blue-200 text-blue-800",
        };
      case "PENDING_ASSIGNMENT":
        return {
          icon: <Clock className="h-4 w-4" />,
          message: "Waiting for an available agent to accept this chat.",
          type: "info" as const,
          className: "bg-yellow-50 border-yellow-200 text-yellow-800",
        };
      case "CLOSED_BY_AGENT":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          message: "Chat ended by agent.",
          type: "info" as const,
          className: "bg-gray-50 border-gray-200 text-gray-800",
        };
      case "CLOSED_BY_CUSTOMER":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          message: "Chat ended by customer.",
          type: "info" as const,
          className: "bg-gray-50 border-gray-200 text-gray-800",
        };
      case "RESOLVED":
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          message: "Chat marked as resolved.",
          type: "success" as const,
          className: "bg-green-50 border-green-200 text-green-800",
        };
      default:
        return null;
    }
  };

  const statusConfig = getStatusMessage(status);

  if (!statusConfig) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className={`border-l-4 p-3 rounded-r-lg ${statusConfig.className} ${className}`}
      >
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <p className="text-sm font-medium">
            {statusConfig.message}
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatStatusBanner;
