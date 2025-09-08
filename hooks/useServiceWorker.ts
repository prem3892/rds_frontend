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

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        console.log('Received message from service worker:', event.data);
        
        if (event.data?.type === 'NOTIFICATION_CLICKED') {
          const { sessionId } = event.data;
          
          if (sessionId) {
            // Focus window
            if (window) {
              window.focus();
            }
            
            // Navigate to chat and select session
            chatActions.setSelectedSessionId(sessionId);
            
            // Navigate to chat page if not already there
            const currentPath = window.location.pathname;
            if (!currentPath.includes('/dashboard/chat')) {
              router.push('/dashboard/chat');
            }
          }
        }
      });
    }
  }, [chatActions, router]);
}

export function ServiceWorkerProvider({ children }: { children: React.ReactNode }) {
  useServiceWorker();
  return React.createElement(React.Fragment, null, children);
}
