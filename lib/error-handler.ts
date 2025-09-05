/**
 * Global error handler for authentication and API errors
 */

import { logoutUser } from '@/lib/token-refresh';

/**
 * Handle 401 Unauthorized errors globally
 * This function should be called when a 401 error is detected
 */
export async function handleUnauthorizedError(): Promise<void> {
  await logoutUser();
}

/**
 * Check if an error is a 401 Unauthorized error
 * @param error - The error to check
 * @returns True if the error is a 401 error
 */
export function isUnauthorizedError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.statusCode === 401 ||
    error?.response?.status === 401
  );
}

/**
 * Enhanced error handler that checks for 401 errors and handles them appropriately
 * @param error - The error to handle
 * @param endpoint - The API endpoint that failed (optional)
 */
export async function handleApiError(error: any, endpoint?: string): Promise<void> {
  console.error('API Error:', error, endpoint);
  
  // Handle 401 errors globally
  if (isUnauthorizedError(error)) {
    console.warn('Unauthorized access detected, logging out user');
    await handleUnauthorizedError();
    return;
  }
  
  // Log other errors for debugging
  console.error('Non-401 API error:', error);
}

/**
 * Create a retry function for failed requests
 * @param originalRequest - The original request function
 * @param maxRetries - Maximum number of retries (default: 1)
 * @returns A function that retries the request
 */
export function createRetryFunction<T extends any[], R>(
  originalRequest: (...args: T) => Promise<R>,
  maxRetries: number = 1
) {
  return async (...args: T): Promise<R> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await originalRequest(...args);
      } catch (error) {
        lastError = error;
        
        // Don't retry 401 errors
        if (isUnauthorizedError(error)) {
          await handleUnauthorizedError();
          throw error;
        }
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };
}
