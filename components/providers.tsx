"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PropsWithChildren } from "react";
import { queryClient } from "@/lib/api"; // Import the shared queryClient
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerProvider } from "@/hooks/useServiceWorker";

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ServiceWorkerProvider>
        {children}
        <Toaster /> {/* For Shadcn toasts */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ServiceWorkerProvider>
    </QueryClientProvider>
  );
}
