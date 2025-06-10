// src/stores/shared.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface SharedState {
  sidebarExpanded: boolean;
  _hasHydrated: boolean;
  actions: {
    setSidebarExpanded: (expanded: boolean) => void;
    toggleSidebar: () => void;
    setHasHydrated: (hasHydrated: boolean) => void;
  };
}

export const useSharedStore = create<SharedState>()(
  persist(
    (set, get) => ({
      sidebarExpanded: true, // Default to expanded
      _hasHydrated: false,
      actions: {
        setSidebarExpanded: (expanded) => set({ sidebarExpanded: expanded }),
        toggleSidebar: () =>
          set((state) => ({ sidebarExpanded: !state.sidebarExpanded })),
        setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      },
    }),
    {
      name: "shared-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sidebarExpanded: state.sidebarExpanded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.actions.setHasHydrated(true);
      },
    }
  )
);

// Selector hooks for easy access
export const useSidebarExpanded = () =>
  useSharedStore((state) => state.sidebarExpanded);
export const useSharedHasHydrated = () =>
  useSharedStore((state) => state._hasHydrated);
export const useSharedActions = () => useSharedStore((state) => state.actions);
