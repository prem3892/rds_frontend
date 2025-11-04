# Push Notifications Implementation

This document describes the push notification system implemented for incoming chat messages and chat requests.

## Overview

The notification system provides browser push notifications when:
1. **New messages** arrive from customers (only customer messages, not agent messages)
2. **New chat requests** are received from customers

Notifications include:
- Click-to-focus functionality that opens the specific chat
- Professional appearance with company branding
- Smart filtering (only shows when page is hidden/minimized)
- Browser permission management

## Architecture

### Core Components

1. **NotificationService** (`services/notificationService.ts`)
   - Singleton service that manages all notification operations
   - Handles permission requests and browser compatibility
   - Provides methods for showing chat-specific notifications

2. **useNotifications Hook** (`hooks/useNotifications.ts`)
   - React hook that provides easy access to notification functionality
   - Handles navigation and chat selection when notifications are clicked
   - Manages permission state

3. **Service Worker** (`public/sw.js`)
   - Handles notification clicks when the app is closed/minimized
   - Provides better notification management and persistence
   - Enables notification actions (Open Chat / Dismiss)

4. **useServiceWorker Hook** (`hooks/useServiceWorker.ts`)
   - Registers and manages the service worker
   - Handles communication between service worker and main thread

### Integration Points

1. **Socket Integration** (`hooks/useSocket.ts`)
   - Listens for `newMessage` and `newChatRequest` socket events
   - Triggers notifications when appropriate events occur
   - Filters to only show notifications for customer messages

2. **Notification Settings UI** (`components/ui/notification-settings.tsx`)
   - User interface for managing notification permissions
   - Shows current permission status and provides guidance
   - Located in the user profile page

## Features

### Smart Notification Logic
- Only shows notifications when the page is hidden (user not actively viewing)
- Filters out agent messages (only shows customer messages)
- Groups notifications by chat session to avoid spam

### Click-to-Open Functionality
- Clicking a notification focuses the app window
- Automatically navigates to the chat page
- Selects the specific chat session that triggered the notification

### Audio Notifications
- Plays custom sound when notifications are shown
- Audio file: `chatsound.mp3` in public folder
- Volume control with user preferences
- Test sound functionality in settings
- Graceful fallback when audio is unavailable

### Browser Compatibility
- Gracefully handles browsers without notification support
- Provides fallbacks for environments without service worker support
- Uses modern Web APIs with proper error handling
- Respects browser audio autoplay policies

### Permission Management
- Clear UI for requesting notification permissions
- Guidance for users when permissions are blocked
- Real-time permission status updates
- Sound settings integrated in notification preferences

## Usage

### For Users

1. **Enable Notifications:**
   - Go to Profile → Push Notifications section
   - Click "Enable Notifications" button
   - Allow browser permission when prompted

2. **Configure Sound:**
   - Adjust volume slider in notification settings
   - Click "Test Sound" to preview audio
   - Sound file can be replaced by updating `chatsound.mp3`

3. **Receiving Notifications:**
   - Notifications appear when new messages/chats arrive
   - Audio plays along with visual notification
   - Click notification to open the specific chat
   - Notifications only show when you're not actively using the app

### For Developers

1. **Show Custom Notification:**
```typescript
import { useNotifications } from '@/hooks/useNotifications';

const { showMessageNotification } = useNotifications();

// Show notification for a message
await showMessageNotification(message, session);
```

2. **Check Permission Status:**
```typescript
const { isPermissionGranted, requestPermission } = useNotifications();

if (!isPermissionGranted) {
  await requestPermission();
}
```

3. **Play Sound Manually:**
```typescript
import { notificationService } from '@/services/notificationService';

// Play notification sound
await notificationService.playSound();

// Set volume (0.0 to 1.0)
notificationService.setSoundVolume(0.8);

// Check if sound is available
if (notificationService.isSoundAvailable) {
  await notificationService.playSound();
}
```

## Implementation Details

### Service Worker Registration
The service worker is automatically registered when the app loads through the `ServiceWorkerProvider` in the main providers configuration.

### Notification Filtering
- **Customer Messages Only**: Only messages with `senderType: "CUSTOMER"` trigger notifications
- **Page Visibility**: Uses `document.hidden` to only show when user isn't actively viewing
- **Session Deduplication**: Multiple messages from the same session don't spam notifications

### Error Handling
- Graceful degradation when notifications aren't supported
- Console logging for debugging notification issues
- Try/catch blocks around all notification operations

## Browser Support

- **Chrome/Edge**: Full support including service worker and actions
- **Firefox**: Full support with some action limitations
- **Safari**: Basic notification support (no actions)
- **Mobile**: Varies by browser and OS

## Security & Privacy

- Notifications only show when user has explicitly granted permission
- No sensitive message content is stored in notification system
- Service worker only handles navigation, no data storage
- All notification handling respects browser security policies

## Future Enhancements

Potential improvements:
1. **Server-Side Push**: Implement Web Push API with server-side triggers
2. **Notification Preferences**: Allow users to customize notification types
3. **Do Not Disturb**: Time-based notification controls
4. **Sound Customization**: Custom notification sounds
5. **Rich Notifications**: Include customer avatars or additional context

## Troubleshooting

### Common Issues

1. **Notifications Not Showing:**
   - Check browser permissions in browser settings
   - Verify page visibility (try minimizing window)
   - Check browser console for errors

2. **Notification Clicks Not Working:**
   - Ensure service worker is registered correctly
   - Check for JavaScript errors in browser console
   - Verify the app URL is correct

3. **Permission Requests Failing:**
   - Some browsers block permission requests from HTTP (use HTTPS)
   - User may have previously blocked notifications
   - Try incognito/private browsing mode for testing

4. **Sound Not Playing:**
   - Ensure `chatsound.mp3` exists in the `public/` folder
   - Browser autoplay policies require user interaction first
   - Check browser console for audio-related errors
   - Test sound manually using the "Test Sound" button

### Debug Information

Enable debug logging by opening browser dev tools and checking console output. The notification system logs all operations including:
- Service worker registration status
- Permission request results
- Notification display attempts
- Click handling events
- Audio loading and playback status
- Volume changes and sound availability
