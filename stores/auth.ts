// src/store/auth.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types";
import { setAuthCookies, clearAuthCookies, syncAuthState } from "@/lib/auth-utils";
// REMOVE: import { queryClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isOnline: boolean; // Agent's online status
  _hasHydrated: boolean;
  actions: {
    login: (user: User, accessToken: string, refreshToken: string) => void;
    logout: () => void;
    updateTokens: (accessToken: string, refreshToken: string) => void;
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
      refreshToken: null,
      isOnline: false,
      _hasHydrated: false,
      actions: {
        login: (user, accessToken, refreshToken) => {
          set({ user, accessToken, refreshToken });
          // Set cookies for middleware compatibility
          setAuthCookies(accessToken, refreshToken);
        },
        logout: () => {
          set({ user: null, accessToken: null, refreshToken: null, isOnline: false });
          // Clear cookies for middleware compatibility
          clearAuthCookies();
          // queryClient.clear() will be called from where logout action is dispatched
        },
        updateTokens: (accessToken, refreshToken) => {
          set({ accessToken, refreshToken });
          // Update cookies for middleware compatibility
          setAuthCookies(accessToken, refreshToken);
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
        refreshToken: state.refreshToken,
        isOnline: state.isOnline,
      }),
      onRehydrateStorage: () => (state) => {
        state?.actions.setHasHydrated(true);
        // Sync auth state with cookies after hydration
        if (typeof window !== 'undefined') {
          syncAuthState();
        }
      },
    }
  )
);

export const useCurrentUser = () => useAuthStore((state) => state.user);
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useRefreshToken = () => useAuthStore((state) => state.refreshToken);
export const useIsAuthenticated = () =>
  useAuthStore((state) => !!state.accessToken && !!state.user);
export const useIsOnline = () => useAuthStore((state) => state.isOnline);
export const useHasHydrated = () => useAuthStore((state) => state._hasHydrated);
export const useAuthActions = () => useAuthStore((state) => state.actions);
export const getAuthToken = () => useAuthStore.getState().accessToken;
export const getRefreshToken = () => useAuthStore.getState().refreshToken;
export const getCurrentUserFromStore = () => useAuthStore.getState().user;
