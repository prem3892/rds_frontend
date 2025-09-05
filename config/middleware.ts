/**
 * Middleware configuration for route protection
 * This file centralizes all route definitions and access control rules
 */

export const ROUTES = {
  // Public routes that don't require authentication
  PUBLIC: [
    '/',
    '/login',
    '/signup',
    '/forgot-password',
    '/initial-admin-signup',
    '/verify-email',
  ],
  
  // Auth routes that should redirect to dashboard if already authenticated
  AUTH: [
    '/login',
    '/signup',
    '/forgot-password',
    '/initial-admin-signup',
    '/verify-email',
  ],
  
  // Protected routes that require authentication
  PROTECTED: [
    '/dashboard',
    '/dashboard/chat',
    '/dashboard/contacts', 
    '/dashboard/history',
    '/dashboard/agents',
    '/dashboard/widgets',
    '/dashboard/canned-messages',
    '/dashboard/auto-messages',
    '/dashboard/blocked-customers',
    '/dashboard/profile',
    '/dashboard/history-new',
    '/dashboard/departments',
    '/dashboard/sessions',
  ],
  
  // Admin-only routes
  ADMIN_ONLY: [
    '/dashboard/agents',
    '/dashboard/departments',
    '/dashboard/widgets',
    '/dashboard/blocked-customers',
    '/dashboard/sessions',
  ],
  
  // API routes that need authentication
  API_PROTECTED: [
    '/api/',
  ],
  
  // Static files and Next.js internals that should be skipped
  SKIP: [
    '/_next/',
    '/api/_next/',
    '/favicon.ico',
    '/robots.txt',
    '/sitemap.xml',
  ],
} as const;

export const FILE_EXTENSIONS = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.ico',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.map',
] as const;

export const REDIRECTS = {
  UNAUTHENTICATED: '/login',
  AUTHENTICATED: '/dashboard',
  UNAUTHORIZED: '/dashboard', // Redirect to dashboard for unauthorized access
} as const;

export const COOKIE_NAMES = {
  AUTH_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
} as const;

export const HEADERS = {
  USER_ID: 'x-user-id',
  USER_EMAIL: 'x-user-email',
  USER_ROLE: 'x-user-role',
} as const;

/**
 * Check if a path matches any of the given patterns
 * @param pathname - The path to check
 * @param patterns - Array of patterns to match against
 * @returns True if path matches any pattern
 */
export function matchesRoute(pathname: string, patterns: readonly string[]): boolean {
  return patterns.some(pattern => {
    if (pattern === '/') {
      // Root pattern should only match exactly '/' or paths that are not sub-paths
      return pathname === '/';
    }
    if (pattern.endsWith('/')) {
      return pathname.startsWith(pattern);
    }
    return pathname === pattern || pathname.startsWith(pattern + '/');
  });
}

/**
 * Check if a path should be skipped by middleware
 * @param pathname - The path to check
 * @returns True if path should be skipped
 */
export function shouldSkipPath(pathname: string): boolean {
  // Check against skip patterns
  if (matchesRoute(pathname, ROUTES.SKIP)) {
    return true;
  }
  
  // Check for file extensions
  const hasFileExtension = FILE_EXTENSIONS.some(ext => pathname.endsWith(ext));
  if (hasFileExtension) {
    return true;
  }
  
  return false;
}

/**
 * Get the appropriate redirect URL based on authentication status
 * @param isAuthenticated - Whether user is authenticated
 * @param userRole - User's role (if authenticated)
 * @param requestedPath - The path user was trying to access
 * @returns The redirect URL
 */
export function getRedirectUrl(
  isAuthenticated: boolean,
  userRole?: string,
  requestedPath?: string
): string {
  if (!isAuthenticated) {
    return REDIRECTS.UNAUTHENTICATED;
  }
  
  // If user is authenticated but trying to access auth pages
  if (requestedPath && matchesRoute(requestedPath, ROUTES.AUTH)) {
    return REDIRECTS.AUTHENTICATED;
  }
  
  // If user is authenticated but trying to access admin-only routes
  if (requestedPath && matchesRoute(requestedPath, ROUTES.ADMIN_ONLY) && userRole !== 'ADMIN') {
    return REDIRECTS.UNAUTHORIZED;
  }
  
  return REDIRECTS.AUTHENTICATED;
}
