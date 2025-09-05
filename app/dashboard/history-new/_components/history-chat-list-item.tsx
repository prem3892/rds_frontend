import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types";
import { parseISO } from "date-fns";
import { 
  Apple, 
  Chrome, 
  Clock, 
  Globe, 
  User, 
  Monitor, 
  Smartphone, 
  Tablet,
  MonitorIcon
} from "lucide-react";
import { rawTimeZones } from '@vvo/tzdb';
import React from "react";

interface HistoryChatListItemProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
}
const countryCodeToEmoji = (code: string) => {
  try {
    const OFFSET = 127397;
    const codePoints = code.toUpperCase().split('').map(char => char.charCodeAt(0) + OFFSET);
  console.log(codePoints, "codePoints");
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    return "🏳️"; // Return neutral flag if conversion fails
  }
};
const HistoryChatListItem = React.memo(
  ({ session, isSelected, onSelect }: HistoryChatListItemProps) => {
 
    console.log(session, "session");

    const getCountryFlag = (timezone: string) => {
      try {
        // Get the timezone from the session data
        // const timezone = session.customerId?.metadata?.browserInfo?.timezone;
        console.log(timezone, "timezone");
        if (!timezone) return "🏳️"; // Return a neutral flag if no timezone

        // Find the timezone in the database
        const tz = rawTimeZones.find(t =>  t.group.includes(timezone));
        const countryCode = tz?.countryCode;
        console.log(tz, "tz");
        console.log(countryCode, "countryCode");
        
        // If we found a country code, convert it to an emoji
        if (countryCode && countryCode.length === 2) {
          console.log(countryCode, "countryCode");
          return countryCodeToEmoji(countryCode);
        }
        
        return "🏳️"; // Return a neutral flag as a fallback
      } catch (error) {
        return "🏳️"; // Return neutral flag if anything goes wrong
      }
    };
    const getBrowserIcon = (userAgent?: string) => {
      if (!userAgent) return <Globe className="w-3 h-3 text-gray-500" />;

      const ua = userAgent.toLowerCase();
      if (ua.includes("chrome") && !ua.includes("edg")) return <Chrome className="w-3 h-3 text-blue-600" />;
      if (ua.includes("firefox")) return <Globe className="w-3 h-3 text-orange-500" />;
      if (ua.includes("safari") && !ua.includes("chrome")) return <Globe className="w-3 h-3 text-blue-500" />;
      if (ua.includes("edge")) return <Globe className="w-3 h-3 text-blue-700" />;
      if (ua.includes("opera")) return <Globe className="w-3 h-3 text-red-500" />;
      return <Globe className="w-3 h-3 text-gray-500" />;
    };

    const getPlatformIcon = (platform?: string) => {
      if (!platform) return <Monitor className="w-3 h-3 text-gray-500" />;

      const platformLower = platform.toLowerCase();
      if (platformLower.includes("mac")) return <Apple className="w-3 h-3 text-gray-800" />;
      if (platformLower.includes("win")) return <MonitorIcon className="w-3 h-3 text-blue-600" />;
      if (platformLower.includes("linux")) return <Monitor className="w-3 h-3 text-green-600" />;
      if (platformLower.includes("ios")) return <Smartphone className="w-3 h-3 text-blue-500" />;
      if (platformLower.includes("android")) return <Smartphone className="w-3 h-3 text-green-500" />;
      if (platformLower.includes("mobile")) return <Smartphone className="w-3 h-3 text-gray-600" />;
      if (platformLower.includes("tablet")) return <Tablet className="w-3 h-3 text-gray-600" />;
      return <Monitor className="w-3 h-3 text-gray-500" />;
    };

    const getCustomerName = () => {
      return (
        session.customerId?.name ||
        session.customerId?.email ||
        `Guest${session.customerId?._id.slice(-6)}`
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

    const getDomainDisplay = () => {
      // Use metadata.initialDomain if available, otherwise fall back to session.domain
      return session.customerId?.metadata?.initialDomain || session.domain || "N/A";
    };

    const getScreenResolution = () => {
      return session.customerId?.metadata?.browserInfo?.screenResolution || "N/A";
    };

    const getLanguage = () => {
      return session.customerId?.metadata?.browserInfo?.language || "N/A";
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
                {getCountryFlag(session.customerId?.metadata?.browserInfo?.timezone || "")}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {getBrowserIcon(session.customerId?.metadata?.browserInfo?.userAgent)}
                {getPlatformIcon(session.customerId?.metadata?.browserInfo?.platform)}
              </div>
            </div>
            <div className="flex  gap-x-1 justify-center text-xs text-gray-500 flex-shrink-0 ml-2">
              <Clock /> {getTimeDisplay()}
            </div>
          </div>

          <div className="text-xs text-gray-600 truncate mb-1">
            At: {getDomainDisplay()}
          </div>

          {/* Additional metadata info */}
          <div className="text-xs text-gray-500 space-y-0.5 mb-2">
            <div className="flex items-center gap-2">
              <span>Screen: {getScreenResolution()}</span>
              <span>Lang: {getLanguage()}</span>
            </div>
            {session.customerId?.metadata?.browserInfo?.timezone && (
              <div className="text-xs text-gray-500">
                TZ: {session.customerId.metadata.browserInfo.timezone}
              </div>
            )}
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
