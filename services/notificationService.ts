// services/notificationService.ts
import { ChatMessage, ChatSession } from "@/types";

export interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
  requireInteraction?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationService {
  private permission: NotificationPermission = "default";
  private isSupported = false;
  private clickHandlers = new Map<string, (data: any) => void>();

  constructor() {
    this.checkSupport();
    this.initializePermission();
    this.setupNotificationClickHandler();
  }

  private checkSupport() {
    this.isSupported = "Notification" in window && "serviceWorker" in navigator;
  }

  private initializePermission() {
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  private setupNotificationClickHandler() {
    if (this.isSupported) {
      // Listen for notification clicks
      navigator.serviceWorker?.ready.then((registration) => {
        if (registration.active) {
          navigator.serviceWorker.addEventListener("message", (event) => {
            if (event.data?.type === "NOTIFICATION_CLICKED") {
              const { tag, data } = event.data;
              const handler = this.clickHandlers.get(tag);
              if (handler) {
                handler(data);
              }
            }
          });
        }
      });

      // Fallback for direct notification clicks (when service worker is not available)
      if ("Notification" in window) {
        // This event is not widely supported, but included for completeness
        window.addEventListener("notificationclick", (event: any) => {
          const { tag, data } = event.notification;
          const handler = this.clickHandlers.get(tag);
          if (handler) {
            handler(data);
          }
          event.notification.close();
          if (window) {
            window.focus();
          }
        });
      }
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      console.warn("Notifications are not supported in this browser");
      return "denied";
    }

    if (this.permission === "default") {
      this.permission = await Notification.requestPermission();
    }

    return this.permission;
  }

  async showNotification(options: NotificationOptions): Promise<void> {
    if (!this.isSupported) {
      console.warn("Notifications are not supported");
      return;
    }

    if (this.permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    try {
      // Check if page is hidden (user is not actively viewing it)
      const isPageHidden = document.hidden;
      
      // Only show notification if page is hidden or user specifically requested it
      if (!isPageHidden && !options.requireInteraction) {
        return; // Don't spam notifications when user is actively using the app
      }

      // Try to use service worker for better notification handling
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const notificationOptions: any = {
          body: options.body,
          icon: options.icon || "/convoia-logo.svg",
          badge: options.badge || "/convoia-logo.svg",
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction || false,
        };

        // Add actions if supported (not all browsers support actions)
        if (options.actions) {
          (notificationOptions as any).actions = options.actions;
        } else {
          // Default actions for chat notifications
          (notificationOptions as any).actions = [
            {
              action: "open",
              title: "Open Chat",
              icon: "/convoia-logo.svg",
            },
            {
              action: "dismiss",
              title: "Dismiss",
              icon: "/convoia-logo.svg",
            },
          ];
        }

        await registration.showNotification(options.title, notificationOptions);
      } else {
        // Fallback to regular notification
        const notification = new Notification(options.title, {
          body: options.body,
          icon: options.icon || "/convoia-logo.svg",
          tag: options.tag,
          data: options.data,
          requireInteraction: options.requireInteraction || false,
        });

        // Handle click for regular notifications
        notification.onclick = () => {
          const handler = this.clickHandlers.get(options.tag || "");
          if (handler) {
            handler(options.data);
          }
          notification.close();
          if (window) {
            window.focus();
          }
        };
      }
    } catch (error) {
      console.error("Failed to show notification:", error);
    }
  }

  onNotificationClick(tag: string, handler: (data: any) => void) {
    this.clickHandlers.set(tag, handler);
  }

  removeClickHandler(tag: string) {
    this.clickHandlers.delete(tag);
  }

  // Chat-specific notification methods
  async showMessageNotification(
    message: ChatMessage,
    session: ChatSession,
    onClickHandler?: (sessionId: string) => void
  ): Promise<void> {
    const customerName = 
      typeof session.customerId === "object" 
        ? session.customerId?.name || "Customer"
        : "Customer";

    const notificationTag = `chat-${session._id}`;
    
    // Set up click handler if provided
    if (onClickHandler) {
      this.onNotificationClick(notificationTag, () => {
        onClickHandler(session._id);
      });
    }

    await this.showNotification({
      title: `New message from ${customerName}`,
      body: message.content.text || "New message received",
      tag: notificationTag,
      data: {
        sessionId: session._id,
        messageId: message._id,
        customerName,
      },
      icon: "/convoia-logo.svg",
      requireInteraction: true,
    });
  }

  async showChatRequestNotification(
    session: ChatSession,
    onClickHandler?: (sessionId: string) => void
  ): Promise<void> {
    const customerName = 
      typeof session.customerId === "object" 
        ? session.customerId?.name || "Customer"
        : "Customer";

    const notificationTag = `chat-request-${session._id}`;
    
    // Set up click handler if provided
    if (onClickHandler) {
      this.onNotificationClick(notificationTag, () => {
        onClickHandler(session._id);
      });
    }

    await this.showNotification({
      title: `New chat request from ${customerName}`,
      body: `New message from ${customerName}`, // Generic message, don't show actual content
      tag: notificationTag,
      data: {
        sessionId: session._id,
        customerName,
      },
      icon: "/convoia-logo.svg",
      requireInteraction: true,
    });
  }

  // Getters
  get isNotificationSupported(): boolean {
    return this.isSupported;
  }

  get notificationPermission(): NotificationPermission {
    return this.permission;
  }

  get isPermissionGranted(): boolean {
    return this.permission === "granted";
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();
