import React from "react";
import { parseISO } from "date-fns";
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
  MonitorIcon
} from "lucide-react";
import { rawTimeZones } from '@vvo/tzdb';

import { FaChrome, FaFirefox, FaSafari, FaEdge, FaTablet,FaOpera, FaQuestionCircle, FaWindows } from 'react-icons/fa';
import {  SiApple, SiLinux, SiAndroid, SiMacos,  SiTableau } from 'react-icons/si'; // Simple Icons for brands


interface ChatListItemProps {
  session: ChatSession & {
    unreadCount?: number;
    lastMessagePreview?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const countryCodeToEmoji = (code: string) => {
  try {
    const OFFSET = 127397;
    const codePoints = code.toUpperCase().split('').map(char => char.charCodeAt(0) + OFFSET);
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    return "🏳️"; // Return neutral flag if conversion fails
  }
};

const ChatListItem = React.memo(
  ({ session, isSelected, onSelect }: ChatListItemProps) => {
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
      if (ua.includes("chrome") && !ua.includes("edg")) return <FaChrome className="w-3 h-3 text-blue-600" />;
      if (ua.includes("firefox")) return <FaFirefox className="w-3 h-3 text-orange-500" />;
      if (ua.includes("safari") && !ua.includes("chrome")) return <FaSafari className="w-3 h-3 text-blue-500" />;
      if (ua.includes("edge")) return <FaEdge className="w-3 h-3 text-blue-700" />;
      if (ua.includes("opera")) return <FaOpera className="w-3 h-3 text-red-500" />;
      return <FaQuestionCircle className="w-3 h-3 text-gray-500" />;
    };

    const getPlatformIcon = (platform?: string) => {
      if (!platform) return <Monitor className="w-3 h-3 text-gray-500" />;
      
      const platformLower = platform.toLowerCase();
      if (platformLower.includes("mac")) return <SiMacos className="w-3 h-3 text-gray-800" />;
        if (platformLower.includes("win")) return <FaWindows className="w-3 h-3 text-blue-600" />;
      if (platformLower.includes("linux")) return <SiLinux className="w-3 h-3 text-green-600" />;
      if (platformLower.includes("ios")) return <SiApple className="w-3 h-3 text-blue-500" />;
      if (platformLower.includes("android")) return <SiAndroid className="w-3 h-3 text-green-500" />;
      if (platformLower.includes("mobile")) return <SiAndroid className="w-3 h-3 text-gray-600" />;
      if (platformLower.includes("tablet")) return <FaTablet className="w-3 h-3 text-gray-600" />;
      return <FaQuestionCircle className="w-3 h-3 text-gray-500" />;
    };

    const getCustomerName = () => {
      return session.customerId?.name || 
             session.customerId?.email || 
             `Guest${session.customerId?._id.slice(-6)}`;
    };

    const getTimeDisplay = () => {
      if (session.lastMessageAt) {
        const date = parseISO(session.lastMessageAt);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
          return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          });
        } else {
          return date.toLocaleDateString('en-GB', { 
            day: '2-digit', 
            month: '2-digit' 
          });
        }
      }
      return "N/A";
    };

    const getDomainDisplay = () => {
      // Use metadata.initialDomain if available, otherwise fall back to session.domain
      return session.customerId?.metadata?.initialDomain || session.domain || "N/A";
    };



    return (
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-start p-2 sm:p-3 h-auto mb-1 sm:mb-2 flex items-start text-left rounded-lg transition-all duration-200 ${
          isSelected 
            ? "bg-gray-100 text-white hover:bg-gray-200" 
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
              <span className="text-base sm:text-lg flex-shrink-0">
                {getCountryFlag(session.customerId?.metadata?.browserInfo?.timezone || "")}
              </span>
              <div className="flex items-center gap-1 flex-shrink-0">
                {getBrowserIcon(session.customerId?.metadata?.browserInfo?.userAgent)}
                {getPlatformIcon(session.customerId?.metadata?.browserInfo?.platform)}
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
            {session.unreadCount && session.unreadCount > 0 && (
              <Badge
                variant="destructive"
                className="text-xs px-1.5 py-0.5 flex-shrink-0"
              >
                {session.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </Button>
    );
  }
);

ChatListItem.displayName = "ChatListItem";

export default ChatListItem;
