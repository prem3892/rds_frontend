/**
 * Hook for managing token refresh functionality
 */

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { initializeTokenRefresh, proactiveTokenRefresh } from '@/lib/token-refresh';

/**
 * Hook to initialize token refresh functionality
 * This should be used in the main dashboard layout
 */
export function useTokenRefresh() {
  const { accessToken, refreshToken } = useAuthStore();

  useEffect(() => {
    // Only initialize if we have both tokens
    if (!accessToken || !refreshToken) {
      return;
    }

    // Initialize proactive token refresh
    const cleanup = initializeTokenRefresh();

    // Also do an immediate check
    proactiveTokenRefresh();

    // Cleanup on unmount
    return cleanup;
  }, [accessToken, refreshToken]);

  return null;
}
