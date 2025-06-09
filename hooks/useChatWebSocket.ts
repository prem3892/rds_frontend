// src/hooks/useChatWebSocket.ts
// This file now re-exports from the new socket hooks for backward compatibility
import {
  useSocketOperations as useNewSocketOperations,
  GlobalSocketInitializer,
} from "@/hooks/useSocket";
import { ChatMessage, ChatSession } from "@/types";

/**
 * @deprecated Use useSocketOperations from hooks/useSocket.ts instead
 */
export function useChatWebSocket() {
  // Return the operations from the new hook for backward compatibility
  return useNewSocketOperations();
}

/**
 * @deprecated Use useSocketOperations from hooks/useSocket.ts instead
 */
export function useSocketOperations() {
  return useNewSocketOperations();
}

/**
 * @deprecated Use GlobalSocketInitializer from hooks/useSocket.ts instead
 */
export function GlobalChatWebSocketInitializer() {
  return GlobalSocketInitializer();
}
