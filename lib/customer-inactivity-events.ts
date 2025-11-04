// Global event system for customer inactivity and chat ended alerts

interface CustomerInactivityData {
  chatSessionId: string;
  message: string;
  customerId: string;
  customerName: string;
  sessionStatus: string;
}

interface ChatEndedData {
  chatSessionId: string;
  message: string;
  customerId: string;
  customerName: string;
  sessionStatus: string;
}

type CustomerInactivityListener = (data: CustomerInactivityData) => void;
type ChatEndedListener = (data: ChatEndedData) => void;

class CustomerInactivityEvents {
  private listeners: Set<CustomerInactivityListener> = new Set();

  // Add a listener for customer inactivity events
  addListener(listener: CustomerInactivityListener): () => void {
    this.listeners.add(listener);
    // Return cleanup function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Emit a customer inactivity event
  emit(data: CustomerInactivityData): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in customer inactivity listener:', error);
      }
    });
  }
}

class ChatEndedEvents {
  private listeners: Set<ChatEndedListener> = new Set();

  // Add a listener for chat ended events
  addListener(listener: ChatEndedListener): () => void {
    this.listeners.add(listener);
    // Return cleanup function
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Emit a chat ended event
  emit(data: ChatEndedData): void {
    this.listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('Error in chat ended listener:', error);
      }
    });
  }
}

// Create singleton instances
export const customerInactivityEvents = new CustomerInactivityEvents();
export const chatEndedEvents = new ChatEndedEvents();

export type { CustomerInactivityData, ChatEndedData };
