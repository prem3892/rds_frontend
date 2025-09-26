// hooks/useNotifications.ts
import { useCallback, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { notificationService } from "@/services/notificationService";
import { ChatMessage, ChatSession } from "@/types";
import { useChatActions, useSelectedChatSessionId } from "@/stores/chat";

interface UseNotificationsReturn {
  isSupported: boolean;
  permission: NotificationPermission;
  isPermissionGranted: boolean;
  requestPermission: () => Promise<NotificationPermission>;
  showMessageNotification: (message: ChatMessage, session: ChatSession) => Promise<void>;
  showChatRequestNotification: (session: ChatSession) => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const router = useRouter();
  const pathname = usePathname();
  const selectedSessionId = useSelectedChatSessionId();
  const chatActions = useChatActions();
  const [permission, setPermission] = useState<NotificationPermission>(
    notificationService.notificationPermission
  );

  // Update permission state when it changes
  useEffect(() => {
    const checkPermission = () => {
      const currentPermission = notificationService.notificationPermission;
      if (currentPermission !== permission) {
        setPermission(currentPermission);
      }
    };

    // Check permission on mount
    checkPermission();

    // Listen for permission changes (though this is not widely supported)
    const interval = setInterval(checkPermission, 1000);

    return () => clearInterval(interval);
  }, [permission]);

  const requestPermission = useCallback(async (): Promise<NotificationPermission> => {
    const result = await notificationService.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const shouldShowNotification = useCallback(
    (sessionId: string) => {
      // Show notification if user is NOT on chat page
      if (!pathname.includes("/dashboard/chat")) {
        return true;
      }

      // Show notification if user IS on chat page but viewing a different session
      if (selectedSessionId !== sessionId) {
        return true;
      }

      // Don't show notification if user is viewing the same session
      return false;
    },
    [pathname, selectedSessionId]
  );

  const handleNotificationClick = useCallback(
    (sessionId: string) => {
      // Only run in browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      // Focus the window
      if (window) {
        window.focus();
      }

      // Navigate to chat page and select the session
      chatActions.setSelectedSessionId(sessionId);
      
      // Navigate to the chat page if not already there
      const currentPath = window.location.pathname;
      if (!currentPath.includes("/dashboard/chat")) {
        router.push("/dashboard/chat?sessionId=" + sessionId);
      }
    },
    [router, chatActions]
  );

  const showMessageNotification = useCallback(
    async (message: ChatMessage, session: ChatSession) => {
      // Only show notification for messages from customers (not agent messages)
      if (message.senderType !== "CUSTOMER") {
        return;
      }

      // Only show if user should see the notification
      if (!shouldShowNotification(session._id)) {
        return;
      }

      await notificationService.showMessageNotification(
        message,
        session,
        handleNotificationClick
      );
    },
    [handleNotificationClick, shouldShowNotification]
  );

  const showChatRequestNotification = useCallback(
    async (session: ChatSession) => {
      // Only show if user should see the notification
      if (!shouldShowNotification(session._id)) {
        return;
      }

      await notificationService.showChatRequestNotification(
        session,
        handleNotificationClick
      );
    },
    [handleNotificationClick, shouldShowNotification]
  );

  return {
    isSupported: notificationService.isNotificationSupported,
    permission,
    isPermissionGranted: permission === "granted",
    requestPermission,
    showMessageNotification,
    showChatRequestNotification,
  };
}
