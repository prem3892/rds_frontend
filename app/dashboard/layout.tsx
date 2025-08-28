"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { GlobalSidebar } from "@/components/layout/global-sidebar";
import {
  useCurrentUser,
  useIsAuthenticated,
  useHasHydrated,
} from "@/stores/auth";
import { useSidebarExpanded } from "@/stores/shared";
import { User } from "@/types";
import { GlobalSocketInitializer } from "@/hooks/useSocket";
import { cn } from "@/lib/utils";
import { MainLayoutWrapper } from "@/components/layout/main-layout-wrapper";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const currentUser = useCurrentUser();
  const hasHydrated = useHasHydrated();
  const sidebarExpanded = useSidebarExpanded();

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
    <div className="flex min-h-screen bg-muted/40 overflow-hidden">
      <GlobalSocketInitializer /> {/* Global persistent socket */}
      {/* <GlobalSidebar currentUser={currentUser} /> */}
<MainLayoutWrapper currentScreen="Dashboard" >
     {children}
  </MainLayoutWrapper>
      {/* <main
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-300 "
        )}
      >

        <div className="flex-1 p-6 sm:p-6 lg:p-8 overflow-hidden">
       
        </div>
      </main> */}
    </div>
  );
}
