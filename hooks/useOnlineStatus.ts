// hooks/useOnlineStatus.ts
import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { socketService } from "@/services/socketService";
import { toast } from "sonner";
import { markLocalStatusChange } from "@/lib/status-change-tracker";
import { AGENTS_QUERY_KEY, queryClient } from "@/lib/api";

/**
 * Custom hook for managing online status with persistence and cross-device synchronization.
 * 
 * Features:
 * - Persists online status in localStorage via Zustand
 * - Restores online status on page refresh (no server call)
 * - Only syncs status changes when user manually changes status
 * - Handles server-side status updates from other devices
 * 
 * Note: Status is NOT automatically restored from server on page refresh
 * to prevent unnecessary notifications to all devices.
 * 
 * @returns {Object} Object containing isOnline state and status management functions
 */
export function useOnlineStatus() {
  const { isOnline, actions } = useAuthStore();

  const setOnlineStatus = useCallback((status: boolean) => {
    // Mark this as a local change to prevent duplicate toast notifications
    markLocalStatusChange();
    
    // Check if socket is connected before attempting to send
    if (!socketService.isConnected) {
      console.warn("Socket not connected. Cannot send status update.");
      toast.error('Connection failed', {
        description: 'Unable to connect to server. Please check your internet connection.',
      });
      // Clear loading state since we're not waiting for server response
      // Note: This will be handled by the component's loading state management
      return;
    }
    
    // Send the status change to the server via socket
    // Do NOT update local status until server confirms
    const success = socketService.setOnlineStatus(status);
    
    if (!success) {
      console.warn("Failed to send online status to server.");
      // This should not happen if socket is connected, but just in case
      // Don't show toast here - let the socket error handling show appropriate message
    }
    

  }, [actions]);

  const toggleOnlineStatus = useCallback(() => {
    setOnlineStatus(!isOnline);
  }, [isOnline, setOnlineStatus]);

  return {
    isOnline,
    setOnlineStatus,
    toggleOnlineStatus,
  };
}
