/**
 * Utility functions for displaying country flags
 */

import { ChatSession } from '@/types/chat';
import { CurrentVisitorData } from '@/lib/visitor.api';

/**
 * Converts a country code to emoji flag
 * @param code - 2-letter country code (e.g., "US", "GB", "CA")
 * @returns Country flag emoji or neutral flag if conversion fails
 */
export const countryCodeToEmoji = (code: string): string => {
  try {
    if (!code || code.length !== 2) {
      return "🏳️"; // Neutral flag for invalid codes
    }
    
    const OFFSET = 127397;
    const codePoints = code.toUpperCase().split('').map(char => char.charCodeAt(0) + OFFSET);
    return String.fromCodePoint(...codePoints);
  } catch (error) {
    console.warn('Failed to convert country code to emoji:', error);
    return "🏳️"; // Return neutral flag if conversion fails
  }
};

/**
 * Gets country flag from chat session using ipInfo country code
 * @param session - Chat session object
 * @returns Country flag emoji
 */
export const getCountryFlagFromSession = (session: ChatSession): string => {
  try {
    const countryCode = session.customerId?.metadata?.ipInfo?.country;
    
    if (!countryCode) {
      return "🏳️"; // Return neutral flag if no country code available
    }
    
    return countryCodeToEmoji(countryCode);
  } catch (error) {
    console.warn('Failed to get country flag from session:', error);
    return "🏳️"; // Return neutral flag if anything goes wrong
  }
};

/**
 * Gets country flag from visitor data using ipInfo country code
 * @param visitor - Current visitor data object
 * @returns Country flag emoji
 */
export const getCountryFlagFromVisitor = (visitor: CurrentVisitorData): string => {
  try {
    // Note: Based on the type definition, visitor ipInfo doesn't include country
    // This is a placeholder in case the API structure changes
    const countryCode = (visitor.metadata?.ipInfo as any)?.country;
    
    if (!countryCode) {
      return "🏳️"; // Return neutral flag if no country code available
    }
    
    return countryCodeToEmoji(countryCode);
  } catch (error) {
    console.warn('Failed to get country flag from visitor:', error);
    return "🏳️"; // Return neutral flag if anything goes wrong
  }
};

/**
 * Gets country flag directly from country code
 * @param countryCode - 2-letter country code
 * @returns Country flag emoji
 */
export const getCountryFlag = (countryCode?: string): string => {
  if (!countryCode) {
    return "🏳️"; // Return neutral flag if no country code provided
  }
  
  return countryCodeToEmoji(countryCode);
};
