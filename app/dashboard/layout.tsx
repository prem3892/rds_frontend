"use client";

import { MainLayoutWrapper } from "@/components/layout/main-layout-wrapper";
import { GlobalSocketInitializer } from "@/hooks/useSocket";
import { useTokenRefresh } from "@/hooks/useTokenRefresh";
import { useCurrentUser, useHasHydrated } from "@/stores/auth";
import CustomerInactivityAlertDialog from "@/components/layout/customer-inactivity-alert-dialog";
import ChatEndedAlertDialog from "@/components/layout/chat-ended-alert-dialog";
import { customerInactivityEvents, chatEndedEvents, type CustomerInactivityData, type ChatEndedData } from "@/lib/customer-inactivity-events";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const currentUser = useCurrentUser();
  const hasHydrated = useHasHydrated();
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Customer inactivity alert state
  const [alertData, setAlertData] = useState<CustomerInactivityData | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  // Chat ended alert state
  const [chatEndedData, setChatEndedData] = useState<ChatEndedData | null>(null);
  const [isChatEndedAlertOpen, setIsChatEndedAlertOpen] = useState(false);

  // Initialize token refresh
  useTokenRefresh();

  // Listen for customer inactivity events
  useEffect(() => {
    const removeListener = customerInactivityEvents.addListener((data) => {
      setAlertData(data);
      setIsAlertOpen(true);
    });

    return removeListener;
  }, []);

  // Listen for chat ended events
  useEffect(() => {
    const removeListener = chatEndedEvents.addListener((data) => {
      setChatEndedData(data);
      setIsChatEndedAlertOpen(true);
    });

    return removeListener;
  }, []);

  // Initialize the layout after hydration
  useEffect(() => {
    if (hasHydrated) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setIsInitialized(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [hasHydrated]);

  // Show loading skeleton during hydration and initialization
  if (!hasHydrated || !isInitialized) {
    return (
      <div className="flex min-h-screen bg-muted/40 overflow-hidden mobile-no-overflow">
        {/* Sidebar Skeleton */}
        <div className="border-r-0 p-4 px-2 bg-white outline-none border-none flex-shrink-0">
          <div className="flex h-full flex-col rounded-3xl bg-gradient-to-b from-[#00398F] to-[#001433]">
            {/* Sidebar Header Skeleton */}
            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center gap-2 justify-center pb-2">
                <div className="h-20 w-32 bg-white/20 animate-pulse rounded" />
                <div className="h-px w-full bg-white/20" />
              </div>
            </div>

            {/* Sidebar Content Skeleton */}
            <div className="px-2 sm:px-4 flex-1">
              <div className="h-full px-4 flex flex-col gap-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="flex items-center gap-4 px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                    <div className="h-5 w-5 bg-white/20 animate-pulse rounded" />
                    <div className="h-4 w-24 bg-white/20 animate-pulse rounded" />
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Footer Skeleton */}
            <div className="p-2 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-3">
                <div className="h-4 sm:h-5 w-4 sm:w-5 bg-white/20 animate-pulse rounded" />
                <div className="h-4 w-16 bg-white/20 animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area Skeleton */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header Skeleton */}
          <header className="flex h-16 items-center justify-between bg-white px-3 sm:px-4 md:px-6 overflow-hidden">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
              {/* Mobile logo skeleton */}
              <div className="block md:hidden">
                <div className="h-16 w-32 bg-gray-200 animate-pulse rounded" />
              </div>
              {/* Desktop title skeleton */}
              <div className="hidden md:block h-8 w-48 bg-gray-200 animate-pulse rounded" />
            </div>

            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              {/* Online/Offline Toggle Skeleton */}
              <div className="hidden sm:flex bg-gray-100 rounded-full p-1 flex-shrink-0">
                <div className="h-8 w-16 bg-gray-200 animate-pulse rounded-full" />
                <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-full" />
              </div>
              {/* Mobile status switch skeleton */}
              <div className="sm:hidden">
                <div className="h-8 w-12 bg-gray-200 animate-pulse rounded-full" />
              </div>

              {/* Profile Section Skeleton */}
              <div className="flex items-center gap-2 p-2 flex-shrink-0">
                <div className="h-8 w-8 bg-gray-200 animate-pulse rounded-full" />
                <div className="hidden sm:flex flex-col items-start text-sm min-w-0 gap-1">
                  <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
                  <div className="h-3 w-40 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-4 w-4 bg-gray-200 animate-pulse rounded" />
              </div>
            </div>
          </header>

          {/* Main Content Skeleton */}
          <main className="flex-1 overflow-auto bg-white p-2 sm:p-3 md:p-4 lg:p-5 mobile-no-overflow">
            <div className="space-y-6">
              {/* Page Title Skeleton */}
              <div className="space-y-2">
                <div className="h-8 w-64 bg-gray-200 animate-pulse rounded" />
                <div className="h-4 w-96 bg-gray-200 animate-pulse rounded" />
              </div>

              {/* Content Grid Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-3">
                    <div className="h-48 w-full bg-gray-200 animate-pulse rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-gray-200 animate-pulse rounded" />
                      <div className="h-3 w-1/2 bg-gray-200 animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40 overflow-hidden mobile-no-overflow">
      <GlobalSocketInitializer /> {/* Global persistent socket */}
      <MainLayoutWrapper>{children}</MainLayoutWrapper>
      
      {/* Customer Inactivity Alert Dialog */}
      {alertData && (
        <CustomerInactivityAlertDialog
          open={isAlertOpen}
          onOpenChange={setIsAlertOpen}
          message={alertData.message}
          customerName={alertData.customerName}
          chatSessionId={alertData.chatSessionId}
        />
      )}

      {/* Chat Ended Alert Dialog */}
      {chatEndedData && (
        <ChatEndedAlertDialog
          open={isChatEndedAlertOpen}
          onOpenChange={setIsChatEndedAlertOpen}
          message={chatEndedData.message}
          customerName={chatEndedData.customerName}
          chatSessionId={chatEndedData.chatSessionId}
        />
      )}
    </div>
  );
}
