// stores/visitor.ts
import { create } from "zustand";
import { useMemo } from "react";
import {
  VisitorInfo,
  VisitorActivityEvent,
  VisitorEventType,
  VisitorStatus,
  ApiVisitorData,
  convertApiDataToVisitorInfo,
  convertCurrentVisitorDataToVisitorInfo,
} from "@/types/visitor";
import { VisitorSyncResponse, CurrentVisitorsResponse, CurrentVisitorData } from "@/lib/visitor.api";

interface VisitorState {
  visitors: Record<string, VisitorInfo>; // customerId -> VisitorInfo
  isInitialSyncComplete: boolean; // Track if initial sync has been completed
  actions: {
    handleVisitorActivity: (event: VisitorActivityEvent) => void;
    removeVisitor: (customerId: string) => void;
    clearAllVisitors: () => void;
    syncVisitorsFromApi: (syncResponse: VisitorSyncResponse) => void;
    syncCurrentVisitorsFromApi: (visitorsResponse: CurrentVisitorsResponse, replaceAll?: boolean) => void;
    setInitialSyncComplete: (complete: boolean) => void;
  };
}

export const useVisitorStore = create<VisitorState>((set, get) => ({
  visitors: {},
  isInitialSyncComplete: false,
  actions: {
    handleVisitorActivity: (event: VisitorActivityEvent) => {
      const {
        customerId,
        customerProfile,
        widget,
        domain,
        currentPageUrl,
        browserInfo,
        timestamp,
        eventType,
      } = event;

      set((state) => {
        const existingVisitor = state.visitors[customerId];
        const now = new Date(timestamp);

        // Determine visitor status based on event type
        let status: VisitorStatus;
        switch (eventType) {
          case VisitorEventType.CONNECT:
            status = VisitorStatus.ONLINE;
            break;
          case VisitorEventType.RECONNECT:
            status = VisitorStatus.RECONNECTED;
            break;
          case VisitorEventType.DISCONNECT:
            status = VisitorStatus.OFFLINE;
            break;
          case VisitorEventType.UPDATE:
            status = existingVisitor?.status || VisitorStatus.ONLINE;
            break;
          default:
            status = VisitorStatus.ONLINE;
        }

        // If visitor is disconnecting, remove them after a delay or mark as offline
        if (eventType === VisitorEventType.DISCONNECT) {
          // For now, we'll mark as offline instead of removing immediately
          // You could implement a cleanup mechanism later
          const updatedVisitors = { ...state.visitors };
          if (updatedVisitors[customerId]) {
            updatedVisitors[customerId] = {
              ...updatedVisitors[customerId],
              status: VisitorStatus.OFFLINE,
              lastActivity: now,
            };
          }
          return { visitors: updatedVisitors };
        }

        // Create or update visitor info
        const visitorInfo: VisitorInfo = {
          customerId,
          name: customerProfile.name,
          email: customerProfile.email,
          phone: customerProfile.phone,
          fingerprint: customerProfile.fingerprint,
          currentPageUrl,
          domain,
          widget,
          browserInfo: {
            userAgent: browserInfo.userAgent,
            language: browserInfo.language,
            platform: browserInfo.platform,
            screenResolution: browserInfo.screenResolution,
            timezone: browserInfo.timezone,
          },
          status,
          lastActivity: now,
          connectedAt: existingVisitor?.connectedAt || now,
          metadata: customerProfile.metadata,
        };

        return {
          visitors: {
            ...state.visitors,
            [customerId]: visitorInfo,
          },
        };
      });
    },

    removeVisitor: (customerId: string) => {
      set((state) => {
        const { [customerId]: removed, ...remainingVisitors } = state.visitors;
        return { visitors: remainingVisitors };
      });
    },

    clearAllVisitors: () => {
      set({ visitors: {} });
    },

    syncVisitorsFromApi: (syncResponse: VisitorSyncResponse) => {
      const { changes, fullSync } = syncResponse;
      
      set((state) => {
        let updatedVisitors = { ...state.visitors };

        // If it's a full sync, clear existing visitors first
        if (fullSync) {
          updatedVisitors = {};
        }

        // Process each change from the API
        changes.forEach((change) => {
          const { type, customerId, data } = change;

          switch (type) {
            case "update":
            case "create":
              // Convert API data to VisitorInfo format
              const visitorInfo = convertApiDataToVisitorInfo(data);
              updatedVisitors[customerId] = visitorInfo;
              break;

            case "delete":
              // Remove the visitor
              delete updatedVisitors[customerId];
              break;

            default:
              console.warn(`Unknown visitor sync change type: ${type}`);
          }
        });

        return {
          visitors: updatedVisitors,
        };
      });
    },

    syncCurrentVisitorsFromApi: (visitorsResponse: CurrentVisitorsResponse, replaceAll: boolean = false) => {
      set((state) => {
        let updatedVisitors = replaceAll ? {} : { ...state.visitors };

        // Process each visitor from the current visitors API
        visitorsResponse.visitors.forEach((visitorData) => {
          // Convert API data to VisitorInfo format
          const visitorInfo = convertCurrentVisitorDataToVisitorInfo(visitorData);
          updatedVisitors[visitorData.customerId] = visitorInfo;
        });

        return {
          visitors: updatedVisitors,
        };
      });
    },

    setInitialSyncComplete: (complete: boolean) => {
      set({ isInitialSyncComplete: complete });
    },
  },
}));

// Selector hooks for easy access
export const useVisitors = () => useVisitorStore((state) => state.visitors);
export const useVisitorActions = () =>
  useVisitorStore((state) => state.actions);
export const useIsInitialSyncComplete = () =>
  useVisitorStore((state) => state.isInitialSyncComplete);

// Helper hook to get visitors as array with filtering and sorting
export const useVisitorsArray = (searchTerm?: string) => {
  const visitors = useVisitorStore((state) => state.visitors);

  return useMemo(() => {
    const visitorsArray = Object.values(visitors);

    // Filter by search term if provided
    let filteredVisitors = visitorsArray;
    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filteredVisitors = visitorsArray.filter(
        (visitor) =>
          visitor.name.toLowerCase().includes(term) ||
          visitor.email?.toLowerCase().includes(term) ||
          visitor.domain.toLowerCase().includes(term)
      );
    }

    // Sort by last activity (most recent first)
    return filteredVisitors.sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }, [visitors, searchTerm]);
};

// Helper hook to get online visitors count
export const useOnlineVisitorsCount = () => {
  return useVisitorStore(
    (state) =>
      Object.values(state.visitors).filter(
        (visitor) =>
          visitor.status === VisitorStatus.ONLINE ||
          visitor.status === VisitorStatus.RECONNECTED
      ).length
  );
};
