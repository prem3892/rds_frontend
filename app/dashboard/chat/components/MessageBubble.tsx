import React from "react";
import { format, parseISO } from "date-fns";
import { ChatMessage } from "@/types";
import { useCurrentUser } from "@/stores/auth";
import { Check, CheckCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useChatStore } from "@/stores/chat";
import { cn, getColorFromString } from "@/lib/utils";
import Image from "next/image";

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar?: boolean;
  isLastInGroup?: boolean;
  isFirstInGroup?: boolean;
}

const MessageBubble = React.memo(({ message, showAvatar = true, isLastInGroup = true, isFirstInGroup = true }: MessageBubbleProps) => {
  const currentUser = useCurrentUser();
  const selectedSession = useChatStore((state) => {
    const sessionId = state.selectedSessionId;
    return sessionId ? state.activeSessions[sessionId] : null;
  });
  
  // Determine if the message is from the currently logged-in agent/admin
  const isOwnMessage =
    message.senderType === "AGENT" && message.senderId === currentUser?.id;
  const isSystem = message.senderType === "SYSTEM";
  const isCustomer = message.senderType === "CUSTOMER";
  const isAgent = message.senderType === "AGENT";

  // Get customer info for avatar
  const getCustomerInfo = () => {
    if (!selectedSession?.customerId) return { name: "Guest", initials: "G" };
    
    const customer = selectedSession.customerId;
    const name = customer.name || customer.email || `Guest${customer._id.slice(-6)}`;
    const initials = customer.name?.charAt(0)?.toUpperCase() ||
                     customer.email?.charAt(0)?.toUpperCase() ||
                     "G";
    
    return { name, initials };
  };

  // Get agent info for avatar from message
  const getAgentInfo = () => {
    // Use agentInfo from the message if available (for agent messages)
    if (message.agentInfo) {
      const name = message.agentInfo.fullName;
      const nameParts = name.split(' ');
      const initials = nameParts.length >= 2 
        ? `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`
        : name.charAt(0);
      
      // Get profile picture URL
      let profilePicture = null;
      if (message.agentInfo.profilePicture) {
        if (message.agentInfo.profilePicture.startsWith('http')) {
          profilePicture = message.agentInfo.profilePicture;
        } else {
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
          const SERVER_BASE_URL = API_BASE_URL.replace('/api/v1', '');
          profilePicture = `${SERVER_BASE_URL}${message.agentInfo.profilePicture}`;
        }
      }
      
      return { name, initials, profilePicture };
    }
    
    // Fallback for messages without agentInfo
    return { name: "Agent", initials: "A", profilePicture: null };
  };

  const customerInfo = getCustomerInfo();
  const agentInfo = getAgentInfo();

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-muted-foreground rounded-full">
          {message.content.text || "System Notification"}
        
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-end gap-2 mb-1 ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* Customer/Agent Avatar - Left side for customer/other agent, hidden for own messages */}
      {!isOwnMessage && (
        <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
          <Avatar className="h-8 w-8">
            {isCustomer ? (
              <>
                <AvatarImage src={undefined} />
                <AvatarFallback className={cn(
                  "text-xs text-white font-medium",
                  getColorFromString(customerInfo.name)
                )}>
                  {customerInfo.initials}
                </AvatarFallback>
              </>
            ) : (
              <>
                <AvatarImage src={agentInfo.profilePicture || undefined} />
                <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
                  {agentInfo.initials}
                </AvatarFallback>
              </>
            )}
          </Avatar>
        </div>
      )}

      {/* Message Bubble */}
      <div className="flex flex-col max-w-[70%]">
        {/* Sender name for first message in group from other agents */}
        {!isOwnMessage && isAgent && isFirstInGroup && (
          <p className="text-xs text-muted-foreground mb-1 ml-2">
            {agentInfo.name}
          </p>
        )}
        
        <div
          className={`p-3 rounded-lg  shadow-sm ${
            isOwnMessage
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
          } ${
            // Adjust border radius based on position in group
            isOwnMessage
              ? showAvatar
                ? "rounded-br-md" // First message from own, reduce bottom-right radius
                : isLastInGroup 
                  ? "rounded-br-md" // Last message from own, reduce bottom-right radius
                  : "rounded-br-md" // Middle message from own
              : showAvatar
                ? "rounded-bl-md" // First message from others, reduce bottom-left radius
                : isLastInGroup
                  ? "rounded-bl-md" // Last message from others, reduce bottom-left radius  
                  : "rounded-bl-md" // Middle message from others
          }`}
        >
          {/* Render different content based on message type */}
          {message.messageType === "IMAGE" ? (
            <div className="space-y-2">
              <div 
                className="relative max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => {
                  // Open image in new tab for full view
                  window.open(`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${message.content.url}`, '_blank');
                }}
              >
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}${message.content.url}`}
                  alt={message.content.filename || "Image"}
                  width={400}
                  height={300}
                  className="max-w-full h-auto rounded-lg"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                  unoptimized={true} // Since these are user-uploaded images from external API
                />
              </div>
              {message.content.filename && (
                <p className="text-xs text-gray-500 truncate">
                  {message.content.filename}
                  {message.content.fileSize && (
                    <span className="ml-2">
                      ({Math.round(message.content.fileSize / 1024)}KB)
                    </span>
                  )}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">
              {message.content.text || JSON.stringify(message.content)}
            </p>
          )}
          
          {/* Timestamp and read status - only show on last message in group */}
          {isLastInGroup && (
            <div className="flex items-center justify-end gap-1 mt-1">
              <p
                className={`text-xs ${
                  isOwnMessage
                    ? "text-blue-200"
                    : "text-muted-foreground/80"
                }`}
              >
                {format(parseISO(message.timestamp), "HH:mm")}
              </p>
              {isOwnMessage && (
                <div className="flex items-center gap-1">
                  {message.readByCustomer ? (
                    <CheckCheck className="w-3 h-3 text-blue-200" />
                  ) : (
                    <Check className="w-3 h-3 text-blue-200" />
                  )}
                  <span className="text-xs text-blue-200">
                    {message.readByCustomer ? "Seen" : "Sent"}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Own Avatar - Right side for own messages */}
      {isOwnMessage && (
        <div className={`flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
          <Avatar className="h-8 w-8">
            <AvatarImage src={agentInfo.profilePicture || undefined} />
            <AvatarFallback className="text-xs bg-blue-100 text-blue-700">
              {agentInfo.initials}
            </AvatarFallback>
          </Avatar>
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
