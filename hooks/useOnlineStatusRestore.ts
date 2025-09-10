// hooks/useOnlineStatusRestore.ts
import { useCallback } from "react";
import { useAuthStore } from "@/stores/auth";
import { socketService } from "@/services/socketService";

/**
 * Hook for manually restoring online status from server
 * This should only be used when explicitly needed, not on every page refresh
 */
export function useOnlineStatusRestore() {
  const { isOnline, actions } = useAuthStore();

  const restoreOnlineStatusFromServer = useCallback(() => {
    // This function can be called manually if you need to sync with server
    // It will send the current local status to the server
    const success = socketService.setOnlineStatus(isOnline);
    
    if (success) {
      console.log(`🔄 Online status restored from server: ${isOnline ? "Online" : "Offline"}`);
    } else {
      console.warn("Failed to restore online status from server. Socket may not be connected.");
    }
    
    return success;
  }, [isOnline]);

  const syncWithServer = useCallback(() => {
    // Alternative method that explicitly syncs current state with server
    return restoreOnlineStatusFromServer();
  }, [restoreOnlineStatusFromServer]);

  return {
    restoreOnlineStatusFromServer,
    syncWithServer,
  };
}
