"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  cn,
  formatRelativeTime,
} from "@/lib/utils";
import { useOnlineVisitorsCount, useVisitorsArray } from "@/stores/visitor";
import { VisitorStatus } from "@/types/visitor";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  ChevronDown,
  Chrome,
  Globe,
  Search,
  Users
} from "lucide-react";
import { useState } from "react";


interface GuestFeedProps {
  className?: string;
  maxHeight?: string;
  onInitiateChat?: (visitorId: string) => void;
}

export function GuestFeed({
  className,
  maxHeight = "h-full",
  onInitiateChat,
}: GuestFeedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"guests" | "chats">("guests");
  const visitors = useVisitorsArray(searchTerm);
  const onlineCount = useOnlineVisitorsCount();

  const getStatusBadge = (status: VisitorStatus) => {
    switch (status) {
      case VisitorStatus.ONLINE:
        return (
          <Badge
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white text-xs px-2 py-1"
          >
            Returning
          </Badge>
        );
      case VisitorStatus.RECONNECTED:
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-2 py-1"
          >
            Returning
          </Badge>
        );
      case VisitorStatus.OFFLINE:
        return (
          <Badge variant="outline" className="text-gray-500 text-xs px-2 py-1">
            Idle
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-gray-500 text-xs px-2 py-1">
            Idle
          </Badge>
        );
    }
  };

  const getActionButton = (status: VisitorStatus, visitorId: string) => {
    if (status === VisitorStatus.ONLINE || status === VisitorStatus.RECONNECTED) {
      return (
        <div className="flex flex-col items-end gap-1">
          <span className="text-green-600 text-xs font-medium">Chat Initiated</span>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="text-green-600 text-xs font-medium p-0 h-auto hover:bg-transparent"
            onClick={() => onInitiateChat?.(visitorId)}
          >
            Initiate Chat
          </Button>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      );
    }
  };

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

  return (
    <Card className={cn("w-full h-full  rounded-3xl border-none shadow-sm ", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Guest Feed
          </CardTitle>
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="search guests by location, url and referrer"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          <Button
            variant={activeTab === "guests" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("guests")}
            className={cn(
              "text-xs",
              activeTab === "guests" 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-transparent"
            )}
          >
            {onlineCount} Active Guests
          </Button>
          <Button
            variant={activeTab === "chats" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab("chats")}
            className={cn(
              "text-xs",
              activeTab === "chats" 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-transparent"
            )}
          >
            Active Chats
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 ">
        <ScrollArea className={cn(maxHeight, "gap-4  px-2")}>
          <AnimatePresence mode="sync">
            {visitors.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-muted-foreground"
              >
                {searchTerm ? (
                  <div>
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No visitors found matching &quot;{searchTerm}&quot;</p>
                  </div>
                ) : (
                  <div>
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No visitors online</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-4 px-4">
                {visitors.map((visitor) => (
                  <motion.div
                    key={visitor.customerId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="relative "
                  >
                    {/* Timeline connector */}
                  
                
                    
                    <div className="flex items-center ">
                      {/* Timeline dot */}
           
                      
                      {/* Time */}
                      <div className="flex relative items-center justify-start ">


                      <div className="text-xs text-gray-500  mt-2 p-3 py-2 flex-shrink-0 rounded-full border-dashed border-2 border-gray-200">
                        {formatRelativeTime(visitor.lastActivity)}
                      </div>

                      <div className="  border-1 border-dashed border-gray-200 bg-gray-200 rounded-full block w-10" />

                      <div className="absolute -right-4 top-3 text-xs text-gray-500  p-1 flex-shrink-0 bg-white rounded-full border-dashed border-2 border-gray-200 ">
                        <span className="size-3 bg-blue-600 rounded-full block" />
                      </div>
                      </div>
                      
                      {/* Visitor Info */}
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm">
                                {visitor.name}
                              </span>
                              <span className="text-lg">
                                {getCountryFlag(visitor.browserInfo.language)}
                              </span>
                              {getBrowserIcon(visitor.browserInfo.userAgent)}
                              {getPlatformIcon(visitor.browserInfo.platform)}
                            </div>
                            
                            <a href={visitor.currentPageUrl} target="_blank" className="text-xs text-gray-600 mb-2">
                              At: {visitor.currentPageUrl}
                            </a>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {getStatusBadge(visitor.status)}
                            {getActionButton(visitor.status, visitor.customerId)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export default GuestFeed;
