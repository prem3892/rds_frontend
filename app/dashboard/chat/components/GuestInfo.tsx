"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getColorFromString } from "@/lib/utils";
import { ChatSession } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Globe,
  MapPin,
  User as UserIcon,
  X
} from "lucide-react";

interface GuestInfoProps {
  session: ChatSession | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockGuest?: (sessionId: string) => void;
}

export function GuestInfo({
  session,
  isOpen,
  onClose,
  onBlockGuest,
}: GuestInfoProps) {
  if (!session) return null;

  const getCustomerName = () => {
    if (typeof session.customerId === "object") {
      return session.customerId?.firstName || 
             session.customerId?.email || 
             `Guest${session.customerId._id.slice(-6)}`;
    }
    return `Guest${session.customerId.slice(-6)}`;
  };

  const getCustomerInitial = () => {
    if (typeof session.customerId === "object") {
      return session.customerId?.firstName?.charAt(0)?.toUpperCase() ||
             session.customerId?.email?.charAt(0)?.toUpperCase() ||
             "G";
    }
    return "G";
  };

  const getLastSeen = () => {
    if (session.lastMessageTimestamp) {
      const date = new Date(session.lastMessageTimestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
    }
    return "Unknown";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 bg-opacity-50 z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Guest Info</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-6">
                  {/* Guest Basic Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className={cn(
                        "text-white font-medium",
                        getColorFromString(getCustomerName())
                      )}>
                        {getCustomerInitial()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{getCustomerName()}</h3>
                      <p className="text-sm text-gray-600">Ghāziābād, India</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onBlockGuest?.(session._id)}
                      className="text-xs"
                    >
                      Block Guest
                    </Button>
                  </div>

                  {/* Contact Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Contact Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email:</Label>
                        <Input
                          id="email"
                          placeholder="Enter email"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name:</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter first name"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name:</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter last name"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm font-medium">Phone:</Label>
                        <Input
                          id="phone"
                          placeholder="Enter phone number"
                          className="text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Guest Details */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Guest Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Last Seen:</span>
                        <span className="font-medium">{getLastSeen()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Region:</span>
                        <span className="font-medium">Uttar Pradesh</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Last Visited Pages:</span>
                        <span className="font-medium truncate">
                          &gt;&gt; At: {session.initialMessage || "testing-chat-app-theta.vercel.app/"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Source:</span>
                        <span className="font-medium">No Referrer</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GuestInfo;
