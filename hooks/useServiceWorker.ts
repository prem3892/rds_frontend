// hooks/useServiceWorker.ts
import React, { useEffect } from 'react';
import { useChatActions } from '@/stores/chat';
import { useRouter } from 'next/navigation';

export function useServiceWorker() {
  const chatActions = useChatActions();
  const router = useRouter();

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return;
    }
    
    if ('serviceWorker' in navigator) {
      // Register service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('New service worker available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Note: Notification click handling is now managed by the notification service
      // to avoid duplicate handlers and ensure proper message structure
    }
  }, [chatActions, router]);
}

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useServiceWorker();
  return React.createElement(React.Fragment, null, children);
}
