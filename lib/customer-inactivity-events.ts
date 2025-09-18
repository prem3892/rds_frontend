// Global event system for customer inactivity alerts

interface CustomerInactivityData {
  chatSessionId: string;
  message: string;
  customerId: string;
  customerName: string;
  sessionStatus: string;
}

type CustomerInactivityListener = (data: CustomerInactivityData) => void;

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

// Create a singleton instance
export const customerInactivityEvents = new CustomerInactivityEvents();

export type { CustomerInactivityData };
