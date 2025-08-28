import React from "react";
import { format, parseISO } from "date-fns";
import { ChatMessage } from "@/types";
import { useCurrentUser } from "@/stores/auth";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble = React.memo(({ message }: MessageBubbleProps) => {
  const currentUser = useCurrentUser();
  // Determine if the message is from the currently logged-in agent/admin
  const isOwnMessage =
    message.senderType === "AGENT" && message.senderId === currentUser?.id;
  const isSystem = message.senderType === "SYSTEM";

  if (isSystem) {
    return (
      <div className="my-2 text-center">
        <span className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-700 text-muted-foreground rounded-full">
          {message.content.text || "System Notification"}
          {message.content.appointmentDetails && (
            <span className="block text-xxs">
              Appointment:{" "}
              {format(
                parseISO(message.content.appointmentDetails.appointmentTime),
                "Pp"
              )}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex my-1 ${isOwnMessage ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
          isOwnMessage
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-white border border-gray-200 rounded-bl-none"
        }`}
      >
        {!isOwnMessage &&
          message.senderType === "AGENT" && ( // If another agent sent message (e.g. transferred chat)
            <p className="text-xs font-semibold mb-1 opacity-70">
              Agent: {message.senderId.slice(-4)}
            </p>
          )}
        <p className="text-sm whitespace-pre-wrap">
          {message.content.text || JSON.stringify(message.content)}
        </p>
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
                {message.readByCustomer ? "Read" : "Sent"}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
