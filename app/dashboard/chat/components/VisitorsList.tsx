"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  Globe,
  Monitor,
  Clock,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useVisitorsArray, useOnlineVisitorsCount } from "@/stores/visitor";
import { VisitorInfo, VisitorStatus } from "@/types/visitor";
import {
  cn,
  formatRelativeTime,
  getInitials,
  getColorFromString,
} from "@/lib/utils";

interface VisitorsListProps {
  className?: string;
  maxHeight?: string;
}

export function VisitorsList({
  className,
  maxHeight = "h-96",
}: VisitorsListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const visitors = useVisitorsArray(searchTerm);
  const onlineCount = useOnlineVisitorsCount();

  // Update current time every 30 seconds for relative time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status: VisitorStatus) => {
    switch (status) {
      case VisitorStatus.ONLINE:
        return (
          <Badge
            variant="default"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Wifi className="w-3 h-3 mr-1" />
            Online
          </Badge>
        );
      case VisitorStatus.RECONNECTED:
        return (
          <Badge
            variant="secondary"
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <Wifi className="w-3 h-3 mr-1" />
            Reconnected
          </Badge>
        );
      case VisitorStatus.OFFLINE:
        return (
          <Badge variant="outline" className="text-gray-500">
            <WifiOff className="w-3 h-3 mr-1" />
            Offline
          </Badge>
        );
      default:
        return null;
    }
  };

  const getDeviceInfo = (browserInfo: VisitorInfo["browserInfo"]) => {
    const parts = [];
    if (browserInfo.platform) parts.push(browserInfo.platform);
    if (browserInfo.language) parts.push(browserInfo.language);
    return parts.join(" • ");
  };

  const getBrowserName = (userAgent?: string) => {
    if (!userAgent) return "Unknown";

    if (userAgent.includes("Chrome")) return "Chrome";
    if (userAgent.includes("Firefox")) return "Firefox";
    if (userAgent.includes("Safari")) return "Safari";
    if (userAgent.includes("Edge")) return "Edge";
    return "Other";
  };

  return (
    <Card className={cn("w-full h-full bg-white rounded-3xl border-none", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Users className="w-5 h-5" />
            Live Visitors
            <Badge variant="secondary" className="ml-2">
              {onlineCount} online
            </Badge>
          </CardTitle>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, email, or domain..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <ScrollArea className={cn(maxHeight, "px-6 pb-6")}>
          <AnimatePresence mode="popLayout">
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
                    <p>No visitors found matching "{searchTerm}"</p>
                  </div>
                ) : (
                  <div>
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No visitors online</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3">
                {visitors.map((visitor) => (
                  <motion.div
                    key={visitor.customerId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage
                          src={
                            visitor.fingerprint
                              ? `data:image/png;base64,${visitor.fingerprint}`
                              : undefined
                          }
                          alt={visitor.name}
                        />
                        <AvatarFallback
                          className={cn(
                            "text-white font-medium",
                            getColorFromString(visitor.name)
                          )}
                        >
                          {getInitials(visitor.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Status indicator */}
                      <div
                        className={cn(
                          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
                          visitor.status === VisitorStatus.ONLINE
                            ? "bg-green-500"
                            : visitor.status === VisitorStatus.RECONNECTED
                            ? "bg-blue-500"
                            : "bg-gray-400"
                        )}
                      />
                    </div>

                    {/* Visitor Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-sm truncate">
                            {visitor.name}
                          </h4>
                          {visitor.email && (
                            <p className="text-xs text-muted-foreground truncate">
                              {visitor.email}
                            </p>
                          )}
                        </div>
                        {getStatusBadge(visitor.status)}
                      </div>

                      {/* Current Page */}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        <span
                          className="truncate"
                          title={visitor.currentPageUrl}
                        >
                          {visitor.currentPageUrl}
                        </span>
                      </div>

                      {/* Device Info */}
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Monitor className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">
                          {getBrowserName(visitor.browserInfo.userAgent)} •{" "}
                          {getDeviceInfo(visitor.browserInfo)}
                        </span>
                      </div>

                      {/* Widget and Department */}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {visitor.widget.name}
                        </Badge>
                        {visitor.widget.departmentIds.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {visitor.widget.departmentIds[0].name}
                          </Badge>
                        )}
                      </div>

                      {/* Last Activity */}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span>
                          Last activity:{" "}
                          {formatRelativeTime(visitor.lastActivity)}
                        </span>
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

export default VisitorsList;
