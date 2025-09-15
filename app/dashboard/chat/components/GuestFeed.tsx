"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  cn,
  formatRelativeTime,
} from "@/lib/utils";
import { 
  useOnlineVisitorsCount, 
  useVisitorsArray, 
  useVisitorActions, 
  useIsInitialSyncComplete
} from "@/stores/visitor";
import { VisitorStatus } from "@/types/visitor";
import { useVisitorSyncMutation, useCurrentVisitorsInfinite } from "@/lib/visitor.api";
import { useGetMyActiveChatSessions } from "@/lib/chat.api";
import { useActiveChatSessions, useChatActions } from "@/stores/chat";
import ChatListItem from "./ChatListItem";
import { AnimatePresence, motion } from "framer-motion";
import {
  Apple,
  ChevronDown,
  Chrome,
  Globe,
  Search,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Loader2
} from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { rawTimeZones } from '@vvo/tzdb';
import { toast } from "sonner";

import { FaChrome, FaFirefox, FaSafari, FaEdge, FaTablet,FaOpera, FaQuestionCircle, FaWindows } from 'react-icons/fa';
import {  SiApple, SiLinux, SiAndroid, SiMacos,  SiTableau } from 'react-icons/si'; // Simple Icons for brands


interface GuestFeedProps {
  className?: string;
  maxHeight?: string;
  onInitiateChat?: (visitorId: string) => void;
  onSelectChat?: (sessionId: string) => void;
  initiatingChatForCustomer?: string | null;
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

export function GuestFeed({
  className,
  maxHeight = "h-full",
  onInitiateChat,
  onSelectChat,
  initiatingChatForCustomer,
}: GuestFeedProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const visitors = useVisitorsArray(searchTerm);
  const onlineCount = useOnlineVisitorsCount();
  
  // Fetch active chat sessions
  const { data: activeChatSessions = [], isLoading: isLoadingChatSessions } = useGetMyActiveChatSessions();
  const activeChatsCount = activeChatSessions.length;
  
  // Chat store hooks
  const activeSessionsMap = useActiveChatSessions();
  const chatStoreActions = useChatActions();
  
  // Prepare active sessions array sorted by last message time
  const activeSessionsArray = Object.values(activeSessionsMap).sort(
    (a, b) =>
      new Date(b.lastMessageAt || b.updatedAt).getTime() -
      new Date(a.lastMessageAt || a.updatedAt).getTime()
  );
  
  // Handler for selecting a chat session
  const handleSelectChatSession = (sessionId: string) => {
    if (onSelectChat) {
      onSelectChat(sessionId);
    } else {
      chatStoreActions.setSelectedSessionId(sessionId);
    }
  };
  
  // Visitor store actions
  const visitorActions = useVisitorActions();
  const isInitialSyncComplete = useIsInitialSyncComplete();
  
  // Infinite scroll reference
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Current visitors infinite query
  const {
    data: visitorsData,
    isLoading: isLoadingVisitors,
    isError: isErrorVisitors,
    error: visitorsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCurrentVisitorsInfinite(
    { limit: 10 }, // Start with 10 visitors per page
    {
      enabled: true,
      staleTime: 30000, // Data is fresh for 30 seconds
      refetchInterval: 60000, // Refetch every minute
    }
  );

  // Handle success/error states with useEffect
  useEffect(() => {
    const infiniteData = visitorsData as any;
    if (infiniteData?.pages && infiniteData.pages.length > 0) {
      // Sync visitors to store on first page load
      if (infiniteData.pages.length === 1 && !isInitialSyncComplete) {
        visitorActions.syncCurrentVisitorsFromApi(infiniteData.pages[0], true); // Replace all on first load
        visitorActions.setInitialSyncComplete(true);
        console.log("Initial visitor sync completed:", infiniteData.pages[0]);
      } else {
        // Append new pages to existing data
        const latestPage = infiniteData.pages[infiniteData.pages.length - 1];
        visitorActions.syncCurrentVisitorsFromApi(latestPage, false); // Don't replace all
        console.log("Visitors page loaded:", latestPage);
      }
    }
  }, [visitorsData, isInitialSyncComplete, visitorActions]);

  useEffect(() => {
    if (isErrorVisitors && visitorsError) {
      console.error("Failed to load visitors:", visitorsError);
      toast.error("Failed to load visitor data");
    }
  }, [isErrorVisitors, visitorsError]);

  // Infinite scroll callback
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        console.log("Loading more visitors...");
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Setup infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) {
        observer.unobserve(observerRef.current);
      }
    };
  }, [handleIntersection]);

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
    const isInitiating = initiatingChatForCustomer === visitorId;
    
    return (
      <div className="flex flex-col items-end gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-green-600 text-xs font-medium p-0 h-auto hover:bg-transparent cursor-pointer flex items-center gap-1"
          onClick={() => onInitiateChat?.(visitorId)}
          disabled={isInitiating}
        >
          {isInitiating && <Loader2 className="w-3 h-3 animate-spin" />}
          {isInitiating ? "Initiating..." : "Initiate Chat"}
        </Button>
        <ChevronDown className="w-3 h-3 text-gray-400" />
      </div>
    );
  };

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

  return (
    <Card className={cn("w-full h-full rounded-3xl border-none shadow-sm", className)}>
      <Tabs defaultValue="guests" className="w-full h-full flex flex-col">
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
          <div className="bg-gray-200 rounded-lg p-1 shadow-inner">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-1">
              <TabsTrigger 
                value="guests" 
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-600 hover:bg-white/50 transition-all duration-200 rounded-md px-3 py-2 border-0 data-[state=active]:shadow-sm"
              >
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                  {onlineCount}
                </span>
                Active Guests
              </TabsTrigger>
              <TabsTrigger 
                value="chats" 
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:bg-gray-200 data-[state=inactive]:text-gray-600 hover:bg-white/50 transition-all duration-200 rounded-md px-3 py-2 border-0 data-[state=active]:shadow-sm"
              >
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full mr-2">
                  {activeChatsCount}
                </span>
                Active Chats
              </TabsTrigger>
            </TabsList>
          </div>
        </CardHeader>

        <CardContent className="p-0 flex-1">
          <TabsContent value="guests" className="mt-0 h-full">
            <ScrollArea className={cn(maxHeight)}>
              <AnimatePresence mode="sync">
                {isLoadingVisitors && visitors.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div>
                      <Loader2 className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                      <p>Loading visitors...</p>
                    </div>
                  </motion.div>
                ) : visitors.length === 0 ? (
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
                  <div className="space-y-3 px-3 pb-4">
                    {visitors.map((visitor) => (
                      <motion.div
                        key={visitor.customerId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="relative flex items-center gap-3"
                      >
                        {/* Activity indicator */}
                        <div className="flex-shrink-0 relative">
                          <div className="w-6 h-6 rounded-full border-2 border-dashed border-gray-300 bg-white flex items-center justify-center">
                            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full block" />
                          </div>
                        </div>
                        
                        {/* Mobile-optimized layout */}
                        <div className="bg-gray-50 rounded-lg p-3 space-y-3 flex-1">
                          {/* Header with name and time */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                              <span className="font-medium text-sm truncate">
                                {visitor.name}
                              </span>
                              <span className="text-lg flex-shrink-0">
                                {getCountryFlag(visitor.browserInfo.timezone || "")}
                              </span>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {getBrowserIcon(visitor.browserInfo.userAgent)}
                                {getPlatformIcon(visitor.browserInfo.platform)}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 flex-shrink-0 bg-white px-2 py-1 rounded-full border border-gray-200">
                              {formatRelativeTime(visitor.lastActivity)}
                            </div>
                          </div>

                          {/* URL */}
                          <a 
                            href={visitor.currentPageUrl} 
                            target="_blank" 
                            className="text-xs text-gray-600 block truncate hover:text-blue-600 transition-colors"
                            title={visitor.currentPageUrl}
                          >
                            At: {visitor.currentPageUrl}
                          </a>

                          {/* Status and action */}
                          <div className="flex items-center justify-between gap-2">
                            {getStatusBadge(visitor.status)}
                            {getActionButton(visitor.status, visitor.customerId)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    
                    {/* Infinite scroll loading indicator */}
                    {isFetchingNextPage && (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Infinite scroll observer */}
                    <div ref={observerRef} className="h-4" />
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="chats" className="mt-0 h-full">
            <ScrollArea className={cn(maxHeight, "gap-4 px-2")}>
              <AnimatePresence mode="sync">
                {isLoadingChatSessions && activeSessionsArray.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div>
                      <Loader2 className="w-8 h-8 mx-auto mb-2 opacity-50 animate-spin" />
                      <p>Loading active chats...</p>
                    </div>
                  </motion.div>
                ) : activeSessionsArray.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-8 text-muted-foreground"
                  >
                    <div>
                      <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No active chats</p>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-2 px-4">
                    {activeSessionsArray.map((session) => (
                      <motion.div
                        key={session._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChatListItem
                          session={session}
                          isSelected={false}
                          onSelect={() => handleSelectChatSession(session._id)}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  );
}

export default GuestFeed;
