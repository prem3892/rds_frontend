import React from "react";
import { parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChatSession } from "@/types";
import { Chrome, Apple, Globe } from "lucide-react";

interface ChatListItemProps {
  session: ChatSession & {
    unreadCount?: number;
    lastMessagePreview?: string;
  };
  isSelected: boolean;
  onSelect: () => void;
}

const ChatListItem = React.memo(
  ({ session, isSelected, onSelect }: ChatListItemProps) => {
    const getCountryFlag = (country?: string) => {
      // Simple country flag emoji mapping
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
      if (typeof session.customerId === "object") {
        return session.customerId?.firstName || 
               session.customerId?.email || 
               `Guest${session.customerId._id.slice(-6)}`;
      }
      return `Guest${session.customerId.slice(-6)}`;
    };

    const getTimeDisplay = () => {
      if (session.lastMessageTimestamp) {
        const date = parseISO(session.lastMessageTimestamp);
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

    return (
      <Button
        variant={isSelected ? "secondary" : "ghost"}
        className={`w-full justify-start p-3 h-auto mb-2 flex items-start text-left rounded-lg transition-all duration-200 ${
          isSelected 
            ? "bg-blue-600 text-white hover:bg-blue-700" 
            : "hover:bg-gray-50"
        }`}
        onClick={onSelect}
      >
        <div className="flex-1 overflow-hidden">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm truncate">
                {getCustomerName()}
              </span>
              <span className="text-lg">
                {getCountryFlag()}
              </span>
              {getBrowserIcon()}
              {getPlatformIcon()}
            </div>
            <div className="text-xs text-gray-500 flex-shrink-0">
              {getTimeDisplay()}
            </div>
          </div>
          
          <div className="text-xs text-gray-600 truncate">
            At: {session.initialMessage || "testing-chat-app-theta.vercel.app/"}
          </div>
          
          {session.unreadCount && session.unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="mt-1 text-xs px-1.5 py-0.5 flex-shrink-0"
            >
              {session.unreadCount}
            </Badge>
          )}
        </div>
      </Button>
    );
  }
);

ChatListItem.displayName = "ChatListItem";

export default ChatListItem;
