// hooks/useOnlineStatus.ts
import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { socketService } from "@/services/socketService";
import { toast } from "sonner";
import { markLocalStatusChange } from "@/lib/status-change-tracker";

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
    
    // Update the local store first (this persists to localStorage)
    actions.setOnlineStatus(status);
    
    // Send the status change to the server via socket
    // This will trigger notifications to other devices
    const success = socketService.setOnlineStatus(status);
    
    if (!success) {
      console.warn("Failed to send online status to server. Socket may not be connected.");
      toast.warning('Status update failed', {
        description: 'Failed to send online status to server. Socket may not be connected.',
      });
    } else {
      // Show immediate confirmation toast for successful status change
      toast.success('Status updated', {
        description: `Your status has been changed to ${status ? 'Online' : 'Offline'}`,
      });
    }
    
    console.log(`Online status changed to: ${status ? "Online" : "Offline"}`);

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
