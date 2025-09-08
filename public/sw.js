// public/sw.js
// Basic service worker for handling notification clicks

const CACHE_NAME = 'rds-frontend-v1';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const { sessionId, customerName } = event.notification.data || {};

  event.waitUntil(
    (async () => {
      // Get all clients (open tabs/windows)
      const clients = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      });

      // Check if there's already an open client
      for (const client of clients) {
        if (client.url.includes('/dashboard') && 'focus' in client) {
          // Focus the existing client and send message
          client.focus();
          client.postMessage({
            type: 'NOTIFICATION_CLICKED',
            sessionId,
            customerName,
          });
          return;
        }
      }

      // If no client is open, open a new one
      if (self.clients.openWindow) {
        const url = sessionId 
          ? `/dashboard/chat?sessionId=${sessionId}`
          : '/dashboard/chat';
        
        const newClient = await self.clients.openWindow(url);
        
        // Send message to the new client when it's ready
        if (newClient) {
          // Wait a bit for the page to load before sending message
          setTimeout(() => {
            newClient.postMessage({
              type: 'NOTIFICATION_CLICKED',
              sessionId,
              customerName,
            });
          }, 1000);
        }
      }
    })()
  );

  // Handle action clicks
  if (event.action) {
    switch (event.action) {
      case 'open':
        // Same behavior as notification click
        break;
      case 'dismiss':
        // Just close the notification (already done above)
        break;
    }
  }
});

// Handle push events (if you plan to add server push notifications later)
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);
  
  if (event.data) {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'New Message', {
        body: data.body || 'You have a new message',
        icon: '/convoia-logo.svg',
        badge: '/convoia-logo.svg',
        tag: data.tag || 'default',
        data: data.data || {},
        requireInteraction: true,
        actions: [
          {
            action: 'open',
            title: 'Open Chat',
            icon: '/convoia-logo.svg',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
          },
        ],
      })
    );
  }
});

// Handle message events from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
