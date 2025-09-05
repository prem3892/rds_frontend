/**
 * Hook to get user information from server-side middleware headers
 * This is useful for components that need to access user data on the server side
 */

import { headers } from 'next/headers';
import { HEADERS } from '@/config/middleware';

/**
 * Get user information from middleware headers (server-side only)
 * @returns User information from headers or null
 */
export async function getServerUser() {
  if (typeof window !== 'undefined') {
    console.warn('getServerUser should only be called on the server side');
    return null;
  }

  try {
    const headersList = await headers();
    console.log(headersList, "headersList from getServerUser");
    const userId = headersList.get(HEADERS.USER_ID);
    const userEmail = headersList.get(HEADERS.USER_EMAIL);
    const userRole = headersList.get(HEADERS.USER_ROLE) as 'ADMIN' | 'AGENT' | null;

    if (!userId || !userEmail || !userRole) {
      return null;
    }

    return {
      id: userId,
      email: userEmail,
      role: userRole,
    };
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
}

/**
 * Check if user has admin role (server-side only)
 * @returns True if user is admin, false otherwise
 */
export async function isServerUserAdmin(): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === 'ADMIN';
}

/**
 * Check if user has agent role (server-side only)
 * @returns True if user is agent, false otherwise
 */
export async function isServerUserAgent(): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === 'AGENT';
}
