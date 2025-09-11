"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, getColorFromString } from "@/lib/utils";
import { useGetContactsByCustomer } from "@/lib/contact.api";
import { ChatSession } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Globe,
  MapPin,
  User as UserIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Phone,
  User
} from "lucide-react";
import { useState } from "react";
import { HistoryGuestInfoSkeleton } from "./history-guest-info-skeleton";

interface HistoryGuestInfoProps {
  session: ChatSession;
  isLoading?: boolean;
}

export function HistoryGuestInfo({ session, isLoading = false }: HistoryGuestInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Fetch contact information for this customer
  const {
    data: existingContacts,
    isLoading: isLoadingContact,
    error: contactError,
  } = useGetContactsByCustomer(session?.customerId?._id || null, {
    retry: false, // Don't retry if contact doesn't exist
  });

  // Get the first contact if any exist
  const existingContact = existingContacts && existingContacts.length > 0 ? existingContacts[0] : null;

  if (isLoading) {
    return <HistoryGuestInfoSkeleton />;
  }

  const getCustomerName = () => {
    return session.customerId?.name || 
           session.customerId?.email || 
           `Guest${session.customerId._id.slice(-6)}`;
  };

  const getCustomerInitial = () => {
    if (typeof session.customerId === "object") {
      return session.customerId?.name?.charAt(0)?.toUpperCase() ||
             session.customerId?.email?.charAt(0)?.toUpperCase() ||
             "G";
    }
    return "G";
  };

  const getLastSeen = () => {
    if (session.lastMessageAt) {
      const date = new Date(session.lastMessageAt);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
    }
    return "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "CLOSED_BY_AGENT":
      case "CLOSED_BY_CUSTOMER":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "ABANDONED_BY_CUSTOMER":
      case "ABANDONED_BY_AGENT":
        return "bg-red-100 text-red-800 border-red-200";
      case "EXPIRED_PENDING_ASSIGNMENT":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "OFFLINE_MESSAGE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full">
      {/* Compact Guest Info Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={undefined} />
            <AvatarFallback className={cn(
              "text-white font-medium",
              getColorFromString(getCustomerName())
            )}>
              {getCustomerInitial()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-base">{getCustomerName()}</h3>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Ghāziābād, India</span>
              <span>•</span>
              <span>{getLastSeen()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className={`px-2 py-1 flex flex-wrap text-wrap truncate rounded-full text-xs border ${getStatusColor(session.status)}`}>
            {session.status.replace(/_/g, " ")}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0 flex items-center justify-center"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Expanded Guest Info */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 overflow-hidden max-h-96 overflow-y-auto"
          >
            <div className="space-y-4 pt-4 border-t border-gray-200">
              {/* Contact Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Contact Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isLoadingContact ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="ml-2 text-xs text-gray-500">Loading contact...</span>
                    </div>
                  ) : existingContact ? (
                    // Show existing contact details
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {existingContact.firstName} {existingContact.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">{existingContact.email}</span>
                      </div>
                      {existingContact.phone && (
                        <div className="flex items-center gap-2 text-xs">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{existingContact.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Saved:</span>
                        <span className="font-medium">
                          {new Date(existingContact.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // Show placeholder when no contact exists
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Name:</span>
                        <span className="font-medium">
                          {typeof session.customerId === "object" ? session.customerId.name || "Not available" : "Not available"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Mail className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Email:</span>
                        <span className="font-medium">
                          {typeof session.customerId === "object" ? session.customerId.email || "Not available" : "Not available"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Phone className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">Phone:</span>
                        <span className="font-medium text-gray-400">Not available</span>
                      </div>
                      <div className="text-xs text-gray-500 italic">
                        No saved contact information for this customer.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Guest Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">Guest Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Last Seen:</span>
                    <span className="font-medium">{getLastSeen()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Region:</span>
                    <span className="font-medium">Uttar Pradesh</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <Globe className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600">Source:</span>
                    <span className="font-medium">
                      {session.customerId.metadata?.initialDomain || "No Referrer"}
                    </span>
                  </div>

                  {session.agentId && (
                    <div className="flex items-center gap-2 text-xs">
                      <UserIcon className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600">Agent:</span>
                      <span className="font-medium">
                        {session.agentId.firstName} {session.agentId.lastName}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HistoryGuestInfo;
