/**
 * Token refresh service for handling automatic token refresh
 */

import { useAuthStore } from '@/stores/auth';
import { RefreshTokenRequest, RefreshTokenResponse, ApiErrorResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// Track if we're currently refreshing to prevent multiple simultaneous requests
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

/**
 * Call the backend refresh token endpoint
 */
async function callRefreshTokenEndpoint(refreshToken: string): Promise<RefreshTokenResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken } as RefreshTokenRequest),
  });

  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json().catch(() => ({
      statusCode: response.status,
      message: 'Token refresh failed',
    }));
    throw errorData;
  }

  return response.json();
}

/**
 * Call the backend logout endpoint
 */
async function callLogoutEndpoint(): Promise<void> {
  const refreshToken = useAuthStore.getState().refreshToken;
  const accessToken = useAuthStore.getState().accessToken;
  
  if (!refreshToken) {
    return; // No token to logout with
  }

  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },

    
    });
  } catch (error) {
    // Log error but don't throw - logout should always succeed on frontend
    console.error('Backend logout failed:', error);
  }
}

/**
 * Refresh the access token using the refresh token
 * @returns Promise<boolean> - true if successful, false if failed
 */
export async function refreshAccessToken(): Promise<boolean> {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = useAuthStore.getState().refreshToken;
  
  if (!refreshToken) {
    console.warn('No refresh token available');
    return false;
  }

  isRefreshing = true;
  
  refreshPromise = (async () => {
    try {
      console.log('Refreshing access token...');
      
      const response = await callRefreshTokenEndpoint(refreshToken);
      
      // Update tokens in store
      const { updateTokens } = useAuthStore.getState().actions;
      updateTokens(response.accessToken, response.refreshToken);
      
      console.log('Access token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      
      // If refresh fails, logout the user
      await logoutUser();
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Logout the user (both frontend and backend)
 */
export async function logoutUser(): Promise<void> {
  try {
    // Call backend logout endpoint
    await callLogoutEndpoint();
  } catch (error) {
    console.error('Backend logout failed:', error);
  } finally {
    // Always clear frontend state
    const { logout } = useAuthStore.getState().actions;
    logout();
    
    // Clear React Query cache
    const { queryClient } = await import('@/lib/api');
    queryClient.clear();
    
    // Redirect to login
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

/**
 * Enhanced fetch function that automatically handles token refresh
 */
export async function fetchWithTokenRefresh(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  
  // Add authorization header if token exists
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // If we get a 401, try to refresh the token
  if (response.status === 401 && token) {
    console.log('Received 401, attempting token refresh...');
    
    const refreshSuccess = await refreshAccessToken();
    
    if (refreshSuccess) {
      // Retry the original request with the new token
      const newToken = useAuthStore.getState().accessToken;
      if (newToken) {
        const retryHeaders: Record<string, string> = {
          ...headers,
          'Authorization': `Bearer ${newToken}`,
        };
        
        return fetch(url, {
          ...options,
          headers: retryHeaders,
        });
      }
    }
  }

  return response;
}

/**
 * Check if a token is expired (with some buffer time)
 * @param token - JWT token to check
 * @param bufferMinutes - Buffer time in minutes (default: 2)
 * @returns boolean - true if token is expired or will expire soon
 */
export function isTokenExpired(token: string, bufferMinutes: number = 2): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    const bufferTime = bufferMinutes * 60; // Convert to seconds
    
    return payload.exp < (currentTime + bufferTime);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't parse the token, consider it expired
  }
}

/**
 * Proactively refresh token if it's about to expire
 */
export async function proactiveTokenRefresh(): Promise<void> {
  const token = useAuthStore.getState().accessToken;
  
  if (!token) {
    return;
  }

  // Check if token expires in the next 5 minutes
  if (isTokenExpired(token, 5)) {
    console.log('Token expires soon, refreshing proactively...');
    await refreshAccessToken();
  }
}

/**
 * Initialize token refresh interval
 * Checks and refreshes tokens every 10 minutes
 */
export function initializeTokenRefresh(): () => void {
  const interval = setInterval(async () => {
    await proactiveTokenRefresh();
  }, 10 * 60 * 1000); // 10 minutes

  // Return cleanup function
  return () => clearInterval(interval);
  
}