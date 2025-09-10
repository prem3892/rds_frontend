// hooks/useToastNotifications.ts
import { useCallback, createElement } from "react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";
import { ChatMessage, ChatSession } from "@/types";
import { useSelectedChatSessionId, useChatActions } from "@/stores/chat";
import { MessageCircle, User } from "lucide-react";

interface UseToastNotificationsReturn {
  showMessageToast: (message: ChatMessage, session: ChatSession) => void;
  showChatRequestToast: (session: ChatSession) => void;
}

export function useToastNotifications(): UseToastNotificationsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const selectedSessionId = useSelectedChatSessionId();
  const chatActions = useChatActions();

  const shouldShowToast = useCallback(
    (sessionId: string) => {
      // Show toast if user is NOT on chat page
      if (!pathname.includes("/dashboard/chat")) {
        return true;
      }

      // Show toast if user IS on chat page but viewing a different session
      if (selectedSessionId !== sessionId) {
        return true;
      }

      // Don't show toast if user is viewing the same session
      return false;
    },
    [pathname, selectedSessionId]
  );

  const handleToastClick = useCallback(
    (sessionId: string) => {
      // Navigate to chat page and select the session
      chatActions.setSelectedSessionId(sessionId);
      
      // Navigate to the chat page if not already there
      if (!pathname.includes("/dashboard/chat")) {
        router.push("/dashboard/chat");
      }
    },
    [router, pathname, chatActions]
  );

  const showMessageToast = useCallback(
    (message: ChatMessage, session: ChatSession) => {
      // Only show for customer messages
      if (message.senderType !== "CUSTOMER") {
        return;
      }

      // Only show if user should see the toast
      if (!shouldShowToast(session._id)) {
        return;
      }

      const customerName = 
        typeof session.customerId === "object" 
          ? session.customerId?.name || "Customer"
          : "Customer";

      const messageText = message.content.text || "New message received";
      
      // Truncate long messages
      const truncatedMessage = messageText.length > 100 
        ? `${messageText.substring(0, 100)}...` 
        : messageText;

      toast(
        `New message from ${customerName}`,
        {
          description: truncatedMessage,
          icon: createElement(MessageCircle, { size: 18 , className: "text-white" }),
          duration: 5000,
          action: {
            label: "View Chat",
            
            onClick: () => handleToastClick(session._id),
          },
        }
      );
    },
    [shouldShowToast, handleToastClick]
  );

  const showChatRequestToast = useCallback(
    (session: ChatSession) => {
      // Only show if user should see the toast
      if (!shouldShowToast(session._id)) {
        return;
      }

      const customerName = 
        typeof session.customerId === "object" 
          ? session.customerId?.name || "Customer"
          : "Customer";

      const isPriorityChat = session.priorityNotificationSentCount > 0;

      toast(
        isPriorityChat 
          ? `PRIORITY chat request from ${customerName}` 
          : `New chat request from ${customerName}`,
        {
          description: isPriorityChat 
            ? `This chat has been waiting for a while and needs immediate attention!` 
            : `New message from ${customerName}`,
          icon: createElement(User, { size: 18 , className: "text-white" }),
          duration: isPriorityChat ? 10000 : 6000, // Longer duration for priority chats
          action: {
            label: "Accept Chat",
            onClick: () => handleToastClick(session._id),
          },
          className: isPriorityChat ? "border-red-500 bg-red-50" : undefined,
        }
      );
    },
    [shouldShowToast, handleToastClick]
  );

  return {
    showMessageToast,
    showChatRequestToast,
  };
}
