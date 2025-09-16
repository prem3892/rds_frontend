// lib/status-change-tracker.ts
// Simple module to track when the current device initiates a status change
// This prevents duplicate toast notifications when the server echoes back the status change

let isLocalStatusChange = false;
let resetTimeout: NodeJS.Timeout | null = null;

export const markLocalStatusChange = () => {
  isLocalStatusChange = true;
  
  // Clear any existing timeout
  if (resetTimeout) {
    clearTimeout(resetTimeout);
  }
  
  // Reset the flag after a short delay to allow for server response
  resetTimeout = setTimeout(() => {
    isLocalStatusChange = false;
  }, 1000);
};

export const isLocalStatusChangeActive = () => isLocalStatusChange;
