import React from "react";
import { parseISO, format } from "date-fns";
import { formatAppointmentDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types";
import ChatStatusIndicator from "./ChatStatusIndicator";
import {
  Chrome,
  Apple,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MonitorSmartphone,
  Laptop,
  MonitorIcon,
  Calendar,
} from "lucide-react";
import { rawTimeZones } from "@vvo/tzdb";

import {
  FaChrome,
  FaFirefox,
  FaSafari,
  FaEdge,
  FaTablet,
  FaOpera,
  FaQuestionCircle,
  FaWindows,
} from "react-icons/fa";
import {
  SiApple,
  SiLinux,
  SiAndroid,
  SiMacos,
  SiTableau,
} from "react-icons/si"; // Simple Icons for brands
import ReactCountryFlag from "react-country-flag";

interface ChatListItemProps {
  session: ChatSession ;
  isSelected: boolean;
  onSelect: () => void;
}

const ChatListItem = React.memo(
  ({ session, isSelected, onSelect }: ChatListItemProps) => {
    const getBrowserIcon = (userAgent?: string) => {
      if (!userAgent) return <Globe className="w-3 h-4 text-gray-500" />;

      const ua = userAgent.toLowerCase();
      if (ua.includes("chrome") && !ua.includes("edg"))
        return <FaChrome className="w-3 h-4 text-blue-600" />;
      if (ua.includes("firefox"))
        return <FaFirefox className="w-3 h-4 text-orange-500" />;
      if (ua.includes("safari") && !ua.includes("chrome"))
        return <FaSafari className="w-3 h-4 text-blue-500" />;
      if (ua.includes("edge"))
        return <FaEdge className="w-3 h-4 text-blue-700" />;
      if (ua.includes("opera"))
        return <FaOpera className="w-3 h-4 text-red-500" />;
      return <FaQuestionCircle className="w-3 h-4 text-gray-500" />;
    };

    const getPlatformIcon = (platform?: string) => {
      if (!platform) return <Monitor className="w-3 h-4 text-gray-500" />;

      const platformLower = platform.toLowerCase();
      if (platformLower.includes("mac"))
        return <SiMacos className="w-3 h-4 text-gray-800" />;
      if (platformLower.includes("win"))
        return <FaWindows className="w-3 h-4 text-blue-600" />;
      if (platformLower.includes("linux"))
        return <SiLinux className="w-3 h-4 text-green-600" />;
      if (platformLower.includes("ios"))
        return <SiApple className="w-3 h-4 text-blue-500" />;
      if (platformLower.includes("android"))
        return <SiAndroid className="w-3 h-4 text-green-500" />;
      if (platformLower.includes("mobile"))
        return <SiAndroid className="w-3 h-4 text-gray-600" />;
      if (platformLower.includes("tablet"))
        return <FaTablet className="w-3 h-4 text-gray-600" />;
      return <FaQuestionCircle className="w-3 h-4 text-gray-500" />;
    };

    const getCustomerName = () => {
      return (
        session.customerId?.name ||
        session.customerId?.email ||
        `Guest-${session.customerId?._id.slice(-6)}`
      );
    };

    const getTimeDisplay = () => {
      const messageTime = session.lastMessageAt
        ? session.lastMessageAt
        : session.initiatedAt;

      if (messageTime) {
        const date = parseISO(messageTime);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();

        if (isToday) {
          return date.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
        } else {
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "2-digit",
          });
        }
      }
      return "N/A";
    };

    const getDomainDisplay = () => {
      // Use metadata.initialDomain if available, otherwise fall back to session.domain
      const initialDomain = session.customerId?.metadata?.initialDomain;
      const fallbackDomain = session.domain;
      const domainToUse = initialDomain || fallbackDomain;
      if (typeof domainToUse === "string" && domainToUse.length > 0) {
        return domainToUse.split("?")[0];
      }
      return "N/A";
    };


    // console.log(session.appointmentData, session.appointmentBooked,"APPOINTMENT DATA");
    return (
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-start p-2 sm:p-3 h-auto mb-1 sm:mb-2 flex items-start text-left rounded-lg transition-all duration-200 ${
          isSelected
            ? "bg-primary/20 text-white hover:bg-primary/50"
            : "hover:bg-gray-50 bg-gray-50"
        }`}
        onClick={onSelect}
      >
        <div className="flex-1 overflow-hidden min-w-0 text-gray-800">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <span className="font-semibold text-xs sm:text-sm truncate">
                {getCustomerName()}
              </span>
             
              <div className="flex items-center  gap-1 flex-shrink-0">
              <ReactCountryFlag
                  countryCode={
                    session.customerId?.metadata?.ipInfo?.country || ""
                  }
                  svg
                  style={{ width: "20px", height: "16px" }}
                />
                {getBrowserIcon(
                  session.customerId?.metadata?.browserInfo?.userAgent
                )}
                {getPlatformIcon(
                  session.customerId?.metadata?.browserInfo?.platform
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 flex-shrink-0 ml-1">
              {getTimeDisplay()}
            </div>
          </div>

          <div className="text-xs text-gray-600 truncate mb-1">
            At: {getDomainDisplay()}
          </div>

          {/* Status and unread count */}
          <div className="flex items-center justify-between mt-1">
            <ChatStatusIndicator status={session.status} className="text-xs" />
            {Number(session.unreadCount ?? 0) > 0 && !isSelected && (
              <Badge
                variant="destructive"
                className="text-xs px-1.5 py-0.5 flex-shrink-0"
              >
                {Number(session.unreadCount)}
              </Badge>
            )}
          </div>

          {/* Appointment information */}
          {session.appointmentBooked && session.appointmentData && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-1 text-xs text-green-700">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">Appointment Booked</span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                {formatAppointmentDate(session.appointmentData?.date || "", "MMM dd, yyyy 'at' h:mm a")}
              </div>
              {/* <div className="text-xs text-green-600 mt-1">
                {session.appointmentData?.date }
              </div> */}
              {session.appointmentData?.notes && (
                <div className="text-xs text-green-600 mt-1 truncate">
                  Note: {session.appointmentData.notes}
                </div>
              )}
            </div>
          )}
        </div>
      </Button>
    );
  }
);

ChatListItem.displayName = "ChatListItem";

export default ChatListItem;
