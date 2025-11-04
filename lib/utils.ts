import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as dateFnsFormat } from "date-fns";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a date to relative time (e.g., "2 minutes ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor(
    (now.getTime() - targetDate.getTime()) / 1000
  );

  if (diffInSeconds < 60) {
    return diffInSeconds <= 5 ? "just now" : `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return diffInMinutes === 1
      ? "1 minute ago"
      : `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return diffInHours === 1 ? "1 hour ago" : `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return diffInDays === 1 ? "1 day ago" : `${diffInDays} days ago`;
  }

  // For older dates, show the actual date
  return targetDate.toLocaleDateString();
}

/**
 * Get initials from a name
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Generate a color based on a string (for consistent avatar colors)
 */
export function getColorFromString(str: string): string {
  const colors = [
    "bg-red-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];

  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

/**
 * Convert literal \n characters to actual line breaks for display
 */
export function formatCannedMessageContent(content: string): string {
  if (!content) return content;
  return content.replace(/\\n/g, '\n');
}

/**
 * Format appointment date without timezone conversion
 * Handles datetime strings in format "YYYY-MM-DDTHH:mm:ss"
 */
export function formatAppointmentDate(dateString: string, format: string = "MMM dd, yyyy 'at' h:mm a"): string {
  if (!dateString) return "Date pending";
  
  try {
    // Parse the datetime string as local time (no timezone conversion)
    const date = new Date(dateString);
    
    // Format using date-fns format function

    return dateFnsFormat(date, format);
  } catch (error) {
    console.error('Error formatting appointment date:', error);
    return "Invalid date";
  }
}
