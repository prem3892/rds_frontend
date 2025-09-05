/**
 * Authentication utilities for client-side and server-side compatibility
 */

import { COOKIE_NAMES } from '@/config/middleware';

/**
 * Set authentication cookies
 * @param accessToken - The access token
 * @param refreshToken - The refresh token (optional)
 * @param maxAge - Cookie max age in seconds (default: 15 minutes for access token)
 */
export function setAuthCookies(
  accessToken: string,
  refreshToken?: string,
  maxAge: number = 15 * 60 // 15 minutes
): void {
  if (typeof document === 'undefined') return; // Skip on server side

  // Set access token cookie
  document.cookie = `${COOKIE_NAMES.AUTH_TOKEN}=${accessToken}; path=/; max-age=${maxAge}; secure; samesite=strict`;
  
  // Set refresh token cookie if provided
  if (refreshToken) {
    const refreshMaxAge = 7 * 24 * 60 * 60; // 7 days
    document.cookie = `${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}; path=/; max-age=${refreshMaxAge}; secure; samesite=strict`;
  }
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return; // Skip on server side

  document.cookie = `${COOKIE_NAMES.AUTH_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${COOKIE_NAMES.REFRESH_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Get authentication token from cookies
 * @returns The access token or null
 */
export function getAuthTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null; // Skip on server side

  const cookies = document.cookie.split(';');
  const authCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${COOKIE_NAMES.AUTH_TOKEN}=`)
  );
  
  if (authCookie) {
    return authCookie.split('=')[1];
  }
  
  return null;
}

/**
 * Get refresh token from cookies
 * @returns The refresh token or null
 */
export function getRefreshTokenFromCookies(): string | null {
  if (typeof document === 'undefined') return null; // Skip on server side

  const cookies = document.cookie.split(';');
  const refreshCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${COOKIE_NAMES.REFRESH_TOKEN}=`)
  );
  
  if (refreshCookie) {
    return refreshCookie.split('=')[1];
  }
  
  return null;
}

/**
 * Check if user is authenticated based on localStorage and cookies
 * @returns True if user appears to be authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  // Check localStorage first (for Zustand store)
  const storedToken = localStorage.getItem('auth-storage');
  if (storedToken) {
    try {
      const parsed = JSON.parse(storedToken);
      if (parsed.state?.accessToken && parsed.state?.refreshToken) {
        return true;
      }
    } catch {
      // Invalid JSON, continue to cookie check
    }
  }

  // Fallback to cookie check
  const cookieToken = getAuthTokenFromCookies();
  const cookieRefreshToken = getRefreshTokenFromCookies();
  return !!(cookieToken && cookieRefreshToken);
}

/**
 * Sync authentication state between localStorage and cookies
 * This ensures both client-side state and server-side cookies are in sync
 */
export function syncAuthState(): void {
  if (typeof window === 'undefined') return;

  const storedToken = localStorage.getItem('auth-storage');
  if (storedToken) {
    try {
      const parsed = JSON.parse(storedToken);
      const accessToken = parsed.state?.accessToken;
      const refreshToken = parsed.state?.refreshToken;
      
      if (accessToken && refreshToken) {
        // Ensure cookies are set if localStorage has tokens
        const cookieToken = getAuthTokenFromCookies();
        const cookieRefreshToken = getRefreshTokenFromCookies();
        
        if (!cookieToken || !cookieRefreshToken || 
            cookieToken !== accessToken || cookieRefreshToken !== refreshToken) {
          setAuthCookies(accessToken, refreshToken);
        }
      }
    } catch {
      // Invalid JSON, clear everything
      clearAuthCookies();
    }
  } else {
    // No localStorage token, clear cookies
    clearAuthCookies();
  }
}
