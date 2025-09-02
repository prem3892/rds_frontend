import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types";
import { parseISO } from "date-fns";
import { Apple, Chrome, Clock, Globe, User } from "lucide-react";
import React from "react";

interface HistoryChatListItemProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
}

const HistoryChatListItem = React.memo(
  ({ session, isSelected, onSelect }: HistoryChatListItemProps) => {
    const getCountryFlag = (country?: string) => {
      const flagMap: Record<string, string> = {
        india: "🇮🇳",
        us: "🇺🇸",
        uk: "🇬🇧",
        canada: "🇨🇦",
        australia: "🇦🇺",
        germany: "🇩🇪",
        france: "🇫🇷",
        spain: "🇪🇸",
        italy: "🇮🇹",
        japan: "🇯🇵",
        china: "🇨🇳",
        brazil: "🇧🇷",
        mexico: "🇲🇽",
        russia: "🇷🇺",
        south_korea: "🇰🇷",
      };

      return flagMap[country?.toLowerCase() || ""] || "🇺🇸";
    };

    const getBrowserIcon = (userAgent?: string) => {
      if (!userAgent) return <Globe className="w-3 h-3" />;

      if (userAgent.includes("Chrome")) return <Chrome className="w-3 h-3" />;
      if (userAgent.includes("Firefox")) return <Globe className="w-3 h-3" />;
      if (userAgent.includes("Safari")) return <Globe className="w-3 h-3" />;
      if (userAgent.includes("Edge")) return <Globe className="w-3 h-3" />;
      return <Globe className="w-3 h-3" />;
    };

    const getPlatformIcon = (platform?: string) => {
      if (!platform) return <Globe className="w-3 h-3" />;

      if (platform.includes("Mac")) return <Apple className="w-3 h-3" />;
      if (platform.includes("Windows")) return <Globe className="w-3 h-3" />;
      if (platform.includes("Linux")) return <Globe className="w-3 h-3" />;
      if (platform.includes("iOS")) return <Apple className="w-3 h-3" />;
      if (platform.includes("Android")) return <Globe className="w-3 h-3" />;
      return <Globe className="w-3 h-3" />;
    };

    const getCustomerName = () => {
      return (
        session.customerId?.name ||
        session.customerId?.email ||
        `Guest${session.customerId._id.slice(-6)}`
      );
    };

    const getTimeDisplay = () => {
      if (session.lastMessageAt) {
        const date = parseISO(session.lastMessageAt);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          });
        } else {
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
          });
        }
      }
      return "N/A";
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "RESOLVED":
          return "bg-green-100 text-green-800";
        case "CLOSED_BY_AGENT":
        case "CLOSED_BY_CUSTOMER":
          return "bg-blue-100 text-blue-800";
        case "ABANDONED_BY_CUSTOMER":
        case "ABANDONED_BY_AGENT":
          return "bg-red-100 text-red-800";
        case "EXPIRED_PENDING_ASSIGNMENT":
          return "bg-yellow-100 text-yellow-800";
        case "OFFLINE_MESSAGE":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    };

    return (
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-start p-2 sm:p-3 h-auto mb-1 flex items-start text-left rounded-lg transition-all duration-200 ${
          isSelected
            ? "bg-blue-100 text-blue-900 border-blue-200"
            : "hover:bg-gray-50 bg-gray-50"
        }`}
        onClick={onSelect}
      >
        <div className="flex-1 overflow-hidden min-w-0 text-gray-800">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
              <span className="font-semibold text-xs sm:text-sm truncate">
                {getCustomerName()}
              </span>
              <span className="text-base sm:text-lg flex-shrink-0">
                {getCountryFlag()}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {getBrowserIcon()}
                {getPlatformIcon()}
              </div>
            </div>
            <div className="flex  gap-x-1 justify-center text-xs text-gray-500 flex-shrink-0 ml-2">
              <Clock /> {getTimeDisplay()}
            </div>
          </div>

          <div className="text-xs text-gray-600 truncate mb-2">
            At: {session.domain || "testing-chat-app-theta.vercel.app/"}
          </div>

          {/* Status Badge and Agent Info */}
          <div className="flex flex-col gap-1">
            <Badge
              variant="outline"
              className={`text-xs px-2 py-1 w-fit  ${getStatusColor(
                session.status
              )}`}
            >
              {session.status.replace(/_/g, " ")}
            </Badge>

            {/* Agent Info */}
            {session.agentId && (
              <div className="text-xs text-gray-500 flex items-center justify-end gap-1">
                <User className="w-3 h-3" />
                <span className="truncate">
                  {session.agentId.firstName} {session.agentId.lastName}
                </span>
              </div>
            )}
          </div>
        </div>
      </Button>
    );
  }
);

HistoryChatListItem.displayName = "HistoryChatListItem";

export default HistoryChatListItem;
