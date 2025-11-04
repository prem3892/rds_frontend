# WebSocket Hooks Usage

## Overview

The WebSocket implementation has been refactored to use a single source of truth (Zustand store) instead of dual state management. This provides better performance and simpler state management.

## Hooks Available

### 1. `useChatWebSocket()`

- **Purpose**: Manages the WebSocket connection lifecycle
- **Usage**: Should only be used in `GlobalChatWebSocketInitializer`
- **Returns**: Socket operation functions

### 2. `useSocketOperations()` ⭐ **Recommended**

- **Purpose**: Provides socket operations for any component
- **Usage**: Use this in your components for socket operations
- **Returns**: `{ sendMessage, acceptChat, setOnlineStatus, isConnected, socket }`

### 3. `GlobalChatWebSocketInitializer()`

- **Purpose**: Initializes the global WebSocket connection
- **Usage**: Already included in dashboard layout

## Example Usage

```tsx
// In any component that needs to send messages
import { useSocketOperations } from "@/hooks/useChatWebSocket";

function ChatComponent() {
  const { sendMessage, acceptChat, isConnected } = useSocketOperations();

  const handleSendMessage = () => {
    if (isConnected) {
      sendMessage({
        chatSessionId: "session-123",
        messageContent: {
          type: "text",
          text: "Hello!",
        },
      });
    }
  };

  const handleAcceptChat = (sessionId: string) => {
    acceptChat(sessionId);
  };

  return (
    <div>
      <div>Status: {isConnected ? "Connected" : "Disconnected"}</div>
      <button onClick={handleSendMessage}>Send Message</button>
    </div>
  );
}
```

## Store Selectors

```tsx
import {
  useSocketInstance,
  useIsSocketConnected,
  useSocketConnectionStatus,
} from "@/stores/chat";

// Get socket instance
const socket = useSocketInstance();

// Get connection status
const isConnected = useIsSocketConnected();

// Get comprehensive connection info
const { socket, isConnected, isSocketConnected } = useSocketConnectionStatus();
```

## Benefits of This Approach

1. **Single Source of Truth**: Socket state is managed only in Zustand store
2. **Better Performance**: No unnecessary re-renders from dual state management
3. **Cleaner Code**: Removed complex socketRef logic
4. **Easier Testing**: Simpler state management makes testing easier
5. **Better Developer Experience**: Clear separation of concerns

## Migration Notes

- Removed `socketRef` - now using store socket directly
- Simplified event listener management
- Added `useSocketOperations` for component-level usage
- Improved connection status tracking
