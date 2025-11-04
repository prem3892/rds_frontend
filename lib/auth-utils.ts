/**
 * Authentication utilities for client-side and server-side compatibility
 */

import { COOKIE_NAMES } from '@/config/middleware';

/**
 * Get token expiration from JWT payload
 * @param token - The JWT token
 * @returns Expiration timestamp in seconds or null if invalid
 */
function getTokenExpirationTime(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp || null;
  } catch {
    return null;
  }
}

/**
 * Set authentication cookies
 * @param accessToken - The access token
 * @param refreshToken - The refresh token (optional)
 * @param customMaxAge - Custom max age in seconds (optional)
 * @param isOnline - Online status (optional)
 */
export function setAuthCookies(
  accessToken: string,
  refreshToken?: string,
  customMaxAge?: number,
  isOnline?: boolean
): void {
  if (typeof document === 'undefined') return; // Skip on server side

  // Calculate access token cookie max age
  let accessMaxAge = customMaxAge;
  if (!accessMaxAge) {
    const tokenExp = getTokenExpirationTime(accessToken);
    if (tokenExp) {
      const currentTime = Math.floor(Date.now() / 1000);
      accessMaxAge = Math.max(0, tokenExp - currentTime);
    } else {
      // Fallback to 1 day if we can't parse the token
      accessMaxAge = 24 * 60 * 60; // 1 day
    }
  }

  // Set access token cookie with proper expiration
  document.cookie = `${COOKIE_NAMES.AUTH_TOKEN}=${accessToken}; path=/; max-age=${accessMaxAge}; secure; samesite=strict`;
  
  // Set refresh token cookie if provided
  if (refreshToken) {
    let refreshMaxAge = 7 * 24 * 60 * 60; // Default 7 days
    
    // Try to get actual refresh token expiration
    const refreshExp = getTokenExpirationTime(refreshToken);
    if (refreshExp) {
      const currentTime = Math.floor(Date.now() / 1000);
      refreshMaxAge = Math.max(0, refreshExp - currentTime);
    }
    
    document.cookie = `${COOKIE_NAMES.REFRESH_TOKEN}=${refreshToken}; path=/; max-age=${refreshMaxAge}; secure; samesite=strict`;
  }
  
  // Set online status cookie if provided
  if (typeof isOnline === 'boolean') {
    document.cookie = `${COOKIE_NAMES.ONLINE_STATUS}=${isOnline ? 'true' : 'false'}; path=/; max-age=${7 * 24 * 60 * 60}; secure; samesite=strict`;
  }
}

/**
 * Clear authentication cookies
 */
export function clearAuthCookies(): void {
  if (typeof document === 'undefined') return; // Skip on server side

  document.cookie = `${COOKIE_NAMES.AUTH_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${COOKIE_NAMES.REFRESH_TOKEN}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${COOKIE_NAMES.ONLINE_STATUS}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
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
 * Get online status from cookies
 * @returns The online status or null
 */
export function getOnlineStatusFromCookies(): boolean | null {
  if (typeof document === 'undefined') return null; // Skip on server side

  const cookies = document.cookie.split(';');
  const onlineStatusCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${COOKIE_NAMES.ONLINE_STATUS}=`)
  );
  
  if (onlineStatusCookie) {
    const value = onlineStatusCookie.split('=')[1];
    return value === 'true';
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
      const isOnline = parsed.state?.isOnline;
      
      if (accessToken && refreshToken) {
        // Ensure cookies are set if localStorage has tokens
        const cookieToken = getAuthTokenFromCookies();
        const cookieRefreshToken = getRefreshTokenFromCookies();
        const cookieOnlineStatus = getOnlineStatusFromCookies();
        
        if (!cookieToken || !cookieRefreshToken || 
            cookieToken !== accessToken || cookieRefreshToken !== refreshToken ||
            cookieOnlineStatus !== isOnline) {
          console.log('Syncing auth state: updating cookies to match localStorage');
          setAuthCookies(accessToken, refreshToken, undefined, isOnline);
        }
      }
    } catch {
      // Invalid JSON, clear everything
      console.warn('Invalid auth storage data, clearing cookies');
      clearAuthCookies();
    }
  } else {
    // No localStorage token, clear cookies
    console.log('No localStorage auth data, clearing cookies');
    clearAuthCookies();
  }
}

/**
 * Debug function to log current authentication state
 * Useful for troubleshooting token issues
 */
export function debugAuthState(): void {
  if (typeof window === 'undefined') {
    console.log('Auth Debug: Running on server side');
    return;
  }

  console.log('=== AUTH STATE DEBUG ===');
  
  // Check localStorage
  const storedData = localStorage.getItem('auth-storage');
  if (storedData) {
    try {
      const parsed = JSON.parse(storedData);
      const accessToken = parsed.state?.accessToken;
      const refreshToken = parsed.state?.refreshToken;
      
      console.log('LocalStorage tokens:', {
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        accessTokenPreview: accessToken ? `${accessToken.slice(0, 20)}...` : 'none',
        refreshTokenPreview: refreshToken ? `${refreshToken.slice(0, 20)}...` : 'none',
      });

      // Check token expiration
      if (accessToken) {
        const exp = getTokenExpirationTime(accessToken);
        if (exp) {
          const now = Math.floor(Date.now() / 1000);
          const timeLeft = exp - now;
          console.log('Access token expiration:', {
            expiresAt: new Date(exp * 1000).toISOString(),
            timeLeftMinutes: Math.floor(timeLeft / 60),
            isExpired: timeLeft <= 0,
          });
        }
      }
      
      if (refreshToken) {
        const exp = getTokenExpirationTime(refreshToken);
        if (exp) {
          const now = Math.floor(Date.now() / 1000);
          const timeLeft = exp - now;
          console.log('Refresh token expiration:', {
            expiresAt: new Date(exp * 1000).toISOString(),
            timeLeftMinutes: Math.floor(timeLeft / 60),
            isExpired: timeLeft <= 0,
          });
        }
      }
    } catch (error) {
      console.error('Error parsing localStorage auth data:', error);
    }
  } else {
    console.log('No localStorage auth data');
  }

  // Check cookies
  const cookieToken = getAuthTokenFromCookies();
  const cookieRefreshToken = getRefreshTokenFromCookies();
  
  console.log('Cookie tokens:', {
    hasAccessToken: !!cookieToken,
    hasRefreshToken: !!cookieRefreshToken,
    accessTokenPreview: cookieToken ? `${cookieToken.slice(0, 20)}...` : 'none',
    refreshTokenPreview: cookieRefreshToken ? `${cookieRefreshToken.slice(0, 20)}...` : 'none',
  });

  console.log('=== END AUTH DEBUG ===');
}
