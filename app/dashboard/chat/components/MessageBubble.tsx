import React from "react";
import { format, parseISO } from "date-fns";
import { ChatMessage } from "@/types";
import { useCurrentUser } from "@/stores/auth";

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
            ? "bg-primary text-primary-foreground rounded-br-none"
            : "bg-background border dark:border-slate-700 rounded-bl-none"
          // Using bg-background for non-own messages to match typical chat UIs better
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
        <p
          className={`text-xs mt-1 ${
            isOwnMessage
              ? "text-blue-200 dark:text-sky-300"
              : "text-muted-foreground/80"
          } text-right`}
        >
          {format(parseISO(message.timestamp), "HH:mm")}
        </p>
      </div>
    </div>
  );
});

MessageBubble.displayName = "MessageBubble";

export default MessageBubble;
