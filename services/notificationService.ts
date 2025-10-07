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
  private audioContext: AudioContext | null = null;
  private notificationAudio: HTMLAudioElement | null = null;

  constructor() {
    // Only initialize if we're in the browser
    if (typeof window !== "undefined") {
      this.checkSupport();
      this.initializePermission();
      this.setupNotificationClickHandler();
      this.initializeAudio();
    }
  }

  private checkSupport() {
    // Check if we're in browser environment
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      this.isSupported = false;
      return;
    }
    this.isSupported = "Notification" in window && "serviceWorker" in navigator;
  }

  private initializePermission() {
    if (typeof window === "undefined") {
      this.permission = "default";
      return;
    }
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
  }

  private setupNotificationClickHandler() {
    // Ensure we're in browser environment
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return;
    }
    
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

  private initializeAudio() {
    try {
      // Initialize audio element for notification sound
      this.notificationAudio = new Audio('/chatsound.mp3');
      this.notificationAudio.preload = 'auto';
      this.notificationAudio.volume = 0.7; // Set volume to 70%
      
      // Handle audio loading errors
      this.notificationAudio.onerror = () => {
        console.warn('Failed to load notification sound');
        this.notificationAudio = null;
      };
    } catch (error) {
      console.warn('Failed to initialize notification audio:', error);
      this.notificationAudio = null;
    }
  }

  private async playNotificationSound() {
    if (!this.notificationAudio) {
      return;
    }

    try {
      // Reset audio to beginning
      this.notificationAudio.currentTime = 0;
      
      // Play the sound
      const playPromise = this.notificationAudio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (error) {
      // This is expected if user hasn't interacted with page yet
      // Browsers block audio without user interaction
      console.debug('Could not play notification sound:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    // Early return if not in browser environment
    if (typeof window === "undefined") {
      return "denied";
    }
    
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
    // Early return if not in browser environment
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }
    
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
      
      // Only show notification if page is hidden or user specifically requested ityy
      // if (!isPageHidden && !options.requireInteraction) {
      //   return; // Don't spam notifications when user is actively using the app
      // }

      // Play notification sound
      await this.playNotificationSound();

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
          sound: '/chatsound.mp3', 
          // Explicitly state the notification should not be silent (some platforms default to silent)
          silent: false, 
        };

        // Add actions if supported (not all browsers support actions)
        if (options.actions && notificationOptions.requireInteraction) {
          (notificationOptions as any).actions = options.actions;
        } 

        await registration.showNotification(options.title, notificationOptions);
        
        // Auto-close notification after 5 seconds if not requiring interaction
        // Note: Service worker notifications don't return a notification object
        // The browser will handle auto-closing based on requireInteraction setting
        if (!options.requireInteraction) {
          // For service worker notifications, we rely on the browser's default behavior
          // which auto-closes notifications after a few seconds when requireInteraction is false
          console.log("Service worker notification auto-closed after 5 seconds");
        }
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

        // Auto-close notification after 5 seconds if not requiring interaction
        if (!options.requireInteraction) {
          setTimeout(() => {
            notification.close();
          }, 5000);
        }
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

  // Public method to play notification sound manually
  async playSound() {
    await this.playNotificationSound();
  }

  // Method to set sound volume (0.0 to 1.0)
  setSoundVolume(volume: number) {
    if (this.notificationAudio && volume >= 0 && volume <= 1) {
      this.notificationAudio.volume = volume;
    }
  }

  // Method to check if sound is available
  get isSoundAvailable(): boolean {
    return this.notificationAudio !== null;
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
      requireInteraction: false,
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

    const isPriorityChat = session.priorityNotificationSentCount > 0;
    const notificationTag = `chat-request-${session._id}`;
    
    // Set up click handler if provided
    if (onClickHandler) {
      this.onNotificationClick(notificationTag, () => {
        onClickHandler(session._id);
      });
    }

    await this.showNotification({
      title: isPriorityChat 
        ? `PRIORITY chat request from ${customerName}` 
        : `New chat request from ${customerName}`,
      body: isPriorityChat 
        ? `This chat has been waiting for a while and needs immediate attention!` 
        : `New message from ${customerName}`,
      tag: notificationTag,
      data: {
        sessionId: session._id,
        customerName,
        isPriority: isPriorityChat,
      },
      icon: "/convoia-logo.svg",
      requireInteraction: false,
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

// Create a singleton instance with lazy initialization
let notificationServiceInstance: NotificationService | null = null;

export const notificationService = (() => {
  if (typeof window === "undefined") {
    // Return a mock object during SSR
    return {
      isNotificationSupported: false,
      notificationPermission: "default" as NotificationPermission,
      isPermissionGranted: false,
      requestPermission: async () => "denied" as NotificationPermission,
      showNotification: async () => {},
      onNotificationClick: () => {},
      removeClickHandler: () => {},
      showMessageNotification: async () => {},
      showChatRequestNotification: async () => {},
      playNotificationSound: async () => {},
      playSound: async () => {},
      setSoundVolume: () => {},
      isSoundAvailable: false,
    };
  }
  
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
})();
