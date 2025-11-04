import { NextRequest, NextResponse } from 'next/server';
import {
  ROUTES,
  REDIRECTS,
  COOKIE_NAMES,
  HEADERS,
  matchesRoute,
  shouldSkipPath,
} from '@/config/middleware';

// Helper function to get token from request
function getTokenFromRequest(request: NextRequest): string | null {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try to get token from cookies (for SSR compatibility)
  const tokenFromCookie = request.cookies.get(COOKIE_NAMES.AUTH_TOKEN)?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  return null;
}

// Helper function to validate token with your NestJS backend
async function validateTokenWithBackend(token: string): Promise<{
  isValid: boolean;
  user?: { id: string; email: string; role: string };
}> {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
    
    const response = await fetch(`${API_BASE_URL}/auth/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      // Add a timeout to prevent hanging requests
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (response.ok) {
      const userData = await response.json();
      return {
        isValid: true,
        user: {
          id: userData.id || userData.userId,
          email: userData.email,
          role: userData.role,
        },
      };
    }

    return { isValid: false };
  } catch (error) {
    console.error('Token validation failed:', error);
    return { isValid: false };
  }
}

// Helper function to create redirect response
function createRedirectResponse(url: string, request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(url, request.url));
  
  // Clear any existing auth cookies on redirect to login
  if (url.includes('/login')) {
    response.cookies.delete(COOKIE_NAMES.AUTH_TOKEN);
    response.cookies.delete(COOKIE_NAMES.REFRESH_TOKEN);
  }
  
  return response;
}

// Helper function to create JSON error response
function createErrorResponse(message: string, status: number = 401): NextResponse {
  return NextResponse.json(
    { error: message, statusCode: status },
    { status }
  );
}

// Main middleware function
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and Next.js internals
  if (shouldSkipPath(pathname)) {
    return NextResponse.next();
  }

  // Get token from request
  const token = getTokenFromRequest(request);
  
  // Handle public routes
  if (matchesRoute(pathname, ROUTES.PUBLIC)) {
    // If user is already authenticated and trying to access auth pages, redirect to dashboard
    if (matchesRoute(pathname, ROUTES.AUTH) && token) {
      const validation = await validateTokenWithBackend(token);
      if (validation.isValid) {
        return createRedirectResponse(REDIRECTS.AUTHENTICATED, request);
      }
    }
    
    // Allow access to public routes
    return NextResponse.next();
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // Check if this is a protected API route
    const isProtectedAPI = ROUTES.API_PROTECTED.some(pattern => 
      pathname.startsWith(pattern)
    );
    
    if (isProtectedAPI) {
      if (!token) {
        return createErrorResponse('Authentication required', 401);
      }
      
      const validation = await validateTokenWithBackend(token);
      if (!validation.isValid || !validation.user) {
        return createErrorResponse('Invalid or expired token', 401);
      }
      
      // Add user info to request headers for API routes to use
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set(HEADERS.USER_ID, validation.user.id);
      requestHeaders.set(HEADERS.USER_EMAIL, validation.user.email);
      requestHeaders.set(HEADERS.USER_ROLE, validation.user.role);
      
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
    
    // Allow access to public API routes
    return NextResponse.next();
  }

  // Handle protected routes
  if (matchesRoute(pathname, ROUTES.PROTECTED)) {
    // Check if user is authenticated
    if (!token) {
      return createRedirectResponse(REDIRECTS.UNAUTHENTICATED, request);
    }
    
    const validation = await validateTokenWithBackend(token);
    if (!validation.isValid || !validation.user) {
      return createRedirectResponse(REDIRECTS.UNAUTHENTICATED, request);
    }
    
    // Check for admin-only routes
    if (matchesRoute(pathname, ROUTES.ADMIN_ONLY)) {
      if (validation.user.role !== 'ADMIN' && validation.user.role !== 'MANAGER') {
        // Redirect non-admin users to dashboard home
        return createRedirectResponse(REDIRECTS.UNAUTHORIZED, request);
      }
    }
    
    // Add user info to request headers for the application to use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(HEADERS.USER_ID, validation.user.id);
    requestHeaders.set(HEADERS.USER_EMAIL, validation.user.email);
    requestHeaders.set(HEADERS.USER_ROLE, validation.user.role);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Default: allow access (for any routes not explicitly handled)
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
