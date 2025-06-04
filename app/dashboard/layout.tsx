// src/app/(dashboard)/layout.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlobalSidebar } from "@/components/layout/global-sidebar";
import {
  useCurrentUser,
  useIsAuthenticated,
  useHasHydrated,
} from "@/stores/auth";
import { User } from "@/types";
import { GlobalChatWebSocketInitializer } from "@/hooks/useChatWebSocket";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const hasHydrated = useHasHydrated();

  useEffect(() => {
    // Only check authentication after the store has hydrated
    if (hasHydrated) {
      console.log(
        "Store hydrated, checking auth:",
        isAuthenticated,
        currentUser
      );
      if (!isAuthenticated) {
        console.log("Not Authenticated, redirecting to login");
        router.replace("/login");
      }
    }
  }, [hasHydrated, isAuthenticated, router]);

  // Show loading while store is hydrating or while not authenticated
  if (!hasHydrated || !isAuthenticated || !currentUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <GlobalChatWebSocketInitializer /> {/* Add this */}
      <GlobalSidebar currentUser={currentUser} />
      <main className="flex flex-1 flex-col pl-72">
        {" "}
        {/* pl-72 to account for sidebar width */}
        {/* Optional: Add a Header component here if needed */}
        {/* <DashboardHeader currentUser={currentUser} /> */}
        <div className="flex-1 p-6 sm:p-8 lg:p-10">{children}</div>
      </main>
    </div>
  );
}
