// hooks/useOnlineStatus.ts
import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { socketService } from "@/services/socketService";
import { toast } from "sonner";

/**
 * Custom hook for managing online status with persistence and cross-device synchronization.
 * 
 * Features:
 * - Persists online status in localStorage via Zustand
 * - Automatically syncs status changes across devices via WebSocket
 * - Restores online status on page refresh
 * - Handles server-side status updates from other devices
 * 
 * @returns {Object} Object containing isOnline state and status management functions
 */
export function useOnlineStatus() {
  const { isOnline, actions } = useAuthStore();

  const setOnlineStatus = useCallback((status: boolean) => {
    // Update the local store first
    actions.setOnlineStatus(status);
    
    // Send the status change to the server via socket
    const success = socketService.setOnlineStatus(status);
    
    if (!success) {
      console.warn("Failed to send online status to server. Socket may not be connected.");
      toast.error('Status update failed', {
        description: 'Failed to send online status to server. Socket may not be connected.',
      });
    }
    
    console.log(`Online status changed to: ${status ? "Online" : "Offline"}`);

    toast.success('Status updated', {
      description: 'Your status has been changed to ' + (status ? 'Online' : 'Offline'),
    });

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
