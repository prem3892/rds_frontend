// src/store/auth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
// REMOVE: import { queryClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isOnline: boolean; // Agent's online status
  _hasHydrated: boolean;
  actions: {
    login: (user: User, accessToken: string) => void;
    logout: () => void;
    updateUser: (updatedUserDetails: Partial<User>) => void;
    setOnlineStatus: (isOnline: boolean) => void;
    setHasHydrated: (hasHydrated: boolean) => void;
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isOnline: false,
      _hasHydrated: false,
      actions: {
        login: (user, accessToken) => set({ user, accessToken }),
        logout: () => {
          set({ user: null, accessToken: null, isOnline: false });
          // queryClient.clear() will be called from where logout action is dispatched
        },
        updateUser: (updatedUserDetails) => {
          if (get().user) {
            set((state) => ({
              user: { ...state.user!, ...updatedUserDetails },
            }));
          }
        },
        setOnlineStatus: (isOnline) => set({ isOnline }),
        setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isOnline: state.isOnline,
      }),
      onRehydrateStorage: () => (state) => {
        state?.actions.setHasHydrated(true);
      },
    }
  )
);

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.accessToken && !!state.user);
export const useIsOnline = () => useAuthStore((state) => state.isOnline);
export const useHasHydrated = () => useAuthStore((state) => state._hasHydrated);
export const useAuthActions = () => useAuthStore((state) => state.actions);
export const getAuthToken = () => useAuthStore.getState().accessToken;
export const getCurrentUserFromStore = () => useAuthStore.getState().user;
