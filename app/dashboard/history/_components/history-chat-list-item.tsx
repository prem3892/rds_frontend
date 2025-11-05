import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types";
import { parseISO, format } from "date-fns";
import { formatAppointmentDate } from "@/lib/utils";
import {
  Clock,
  Globe,
  User,
  Monitor,
  Smartphone,
  Tablet,
  Calendar,
} from "lucide-react";
import React from "react";

import {
  FaChrome,
  FaFacebook,
  FaFirefox,
  FaGoogle,
  FaSafari,
  FaEdge,
  FaOpera,
  FaQuestionCircle,
  FaWindows,
  FaTablet,
} from "react-icons/fa";
import { SiApple, SiLinux, SiAndroid, SiMacos } from "react-icons/si";
import ReactCountryFlag from "react-country-flag";
import { getTimeZones, TimeZone } from "@vvo/tzdb";

interface HistoryChatListItemProps {
  session: ChatSession;
  isSelected: boolean;
  onSelect: () => void;
}
const HistoryChatListItem = React.memo(
  ({ session, isSelected, onSelect }: HistoryChatListItemProps) => {
    console.log(session, "session");

    const getBrowserIcon = (userAgent?: string) => {
      if (!userAgent) return <Globe className="w-3 h-3 text-gray-500" />;

      const ua = userAgent.toLowerCase();
      if (ua.includes("chrome") && !ua.includes("edg"))
        return <FaChrome className="w-3 h-3 text-blue-600" />;
      if (ua.includes("firefox"))
        return <FaFirefox className="w-3 h-3 text-orange-500" />;
      if (ua.includes("safari") && !ua.includes("chrome"))
        return <FaSafari className="w-3 h-3 text-blue-500" />;
      if (ua.includes("edge"))
        return <FaEdge className="w-3 h-3 text-blue-700" />;
      if (ua.includes("opera"))
        return <FaOpera className="w-3 h-3 text-red-500" />;
      return <FaQuestionCircle className="w-3 h-3 text-gray-500" />;
    };

    const getPlatformIcon = (platform?: string) => {
      if (!platform) return <Monitor className="w-3 h-3 text-gray-500" />;

      const platformLower = platform.toLowerCase();
      if (platformLower.includes("mac"))
        return <SiApple className="w-3 h-3 text-gray-800" />;
      if (platformLower.includes("win"))
        return <FaWindows className="w-3 h-3 text-blue-600" />;
      if (platformLower.includes("linux"))
        return <SiLinux className="w-3 h-3 text-green-600" />;
      if (platformLower.includes("ios"))
        return <SiApple className="w-3 h-3 text-blue-500" />;
      if (platformLower.includes("android"))
        return <SiAndroid className="w-3 h-3 text-green-500" />;
      if (platformLower.includes("mobile"))
        return <SiAndroid className="w-3 h-3 text-gray-600" />;
      if (platformLower.includes("tablet"))
        return <FaTablet className="w-3 h-3 text-gray-600" />;
      return <Monitor className="w-3 h-3 text-gray-500" />;
    };

    const getSourceIcon = (currentPageUrl?: string) => {
      if (!currentPageUrl) return null;

      try {
        const url = new URL(currentPageUrl);
        const searchParams = url.searchParams;

        // Check for Google Ads parameters
        if (
          searchParams.has("gad_source") ||
          searchParams.has("gad_campaignid") ||
          searchParams.has("gbraid") ||
          searchParams.get("utm_source")?.toLowerCase().includes("google") ||
          searchParams.get("utm_medium")?.toLowerCase().includes("cpc") ||
          searchParams.get("utm_medium")?.toLowerCase().includes("ppc")
        ) {
          return (
            <FaGoogle className="w-3 h-3 text-blue-500" title="Google Ads" />
          );
        }

        // Check for Facebook parameters
        if (
          searchParams.get("utm_medium")?.toLowerCase() === "fb" ||
          searchParams.get("utm_source")?.toLowerCase().includes("facebook") ||
          searchParams.get("utm_source")?.toLowerCase().includes("meta") ||
          searchParams.has("fbclid")
        ) {
          return (
            <FaFacebook className="w-3 h-3 text-blue-600" title="Facebook" />
          );
        }

        return null;
      } catch (error) {
        // If URL parsing fails, return null
        return null;
      }
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
            hour12: true,
          });
        } else {
          return date.toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "2-digit",
          });
        }
      }
      return "N/A";
    };

    const getDomainDisplay = () => {
      // Use metadata.initialDomain if available, otherwise fall back to session.domain
      return (
        session.customerId?.metadata?.initialDomain?.split("?")[0] ||
        session.domain.split("?")[0] ||
        "N/A"
      );
    };

    const getScreenResolution = () => {
      return (
        session.customerId?.metadata?.browserInfo?.screenResolution || "N/A"
      );
    };

    const getLanguage = () => {
      return session.customerId?.metadata?.browserInfo?.language || "N/A";
    };

    const getIpInfo = () => {
      return session.customerId?.metadata?.ipInfo.clientIp || "N/A";
    };

    const getCountry = () => {
      const countryCode = session.customerId?.metadata?.ipInfo.country;
      if (!countryCode) {
        return "N/A";
      }
      const timeZones = getTimeZones();
      const timeZone = timeZones.find(
        (tz: TimeZone) => tz.countryCode === countryCode
      );
      return timeZone ? timeZone.countryName : countryCode;
    };

    const getCity = () => {
      return session.customerId?.metadata?.ipInfo.city || "N/A";
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case "RESOLVED":
          return "bg-green-100 text-green-800";
        case "CLOSED_BY_AGENT":
        case "CLOSED_BY_CUSTOMER":
          return "bg-orange-100 text-orange-800";
        case "ABANDONED_BY_CUSTOMER":
        case "ABANDONED_BY_AGENT":
          return "bg-red-100 text-red-800";
        case "EXPIRED_PENDING_ASSIGNMENT":
          return "bg-yellow-100 text-yellow-800";
        case "OFFLINE_MESSAGE":
          return "bg-gray-100 text-gray-800";
        default:
          return "bg-primary/20 text-blue-800";
      }
    };

    return (
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-start p-2 sm:p-3 h-auto mb-1 flex items-start text-left rounded-lg transition-all duration-200 ${
          isSelected
            ? "bg-blue-100 text-blue-900 border-blue-200 hover:bg-primary/20"
            : "hover:bg-primary20 bg-white"
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
                <ReactCountryFlag
                  countryCode={
                    session.customerId?.metadata?.ipInfo?.country || ""
                  }
                  svg
                  style={{ width: "20px", height: "15px" }}
                />
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {getBrowserIcon(
                  session.customerId?.metadata?.browserInfo?.userAgent
                )}
                {getPlatformIcon(
                  session.customerId?.metadata?.browserInfo?.platform
                )}
                {getSourceIcon(session.customerId?.metadata?.currentPageUrl)}
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
            {/* {session.customerId?.metadata?.browserInfo?.timezone && (
              <div className="text-xs text-gray-500">
                TZ: {session.customerId.metadata.browserInfo.timezone}
              </div>
            )} */}
            <div className="flex flex-col items-start gap-2 flex-wrap">
              <div className="w-full flex-wrap">
                <Badge className="rounded-full truncate text-wrap text-ellipsis text-xs">
                  IP: {getIpInfo()}
                </Badge>
              </div>
              {session.customerId?.metadata?.ipInfo.country && (
                <Badge className="rounded-full truncate text-wrap">
                  Country: {getCountry()}
                </Badge>
              )}
              {/* <Badge  className="rounded-full">City: {getCity()}</Badge> */}
            </div>
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

          {/* Appointment information */}
          {session.appointmentBooked && session.appointmentData && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center gap-1 text-xs text-green-700">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">Appointment Booked</span>
              </div>
              <div className="text-xs text-green-600 mt-1">
                {formatAppointmentDate(
                  session.appointmentData.date,
                  "MMM dd, yyyy 'at' h:mm a"
                )}
              </div>
              {session.appointmentData.notes && (
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

HistoryChatListItem.displayName = "HistoryChatListItem";

export default HistoryChatListItem;
