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
        <Toaster
          toastOptions={{

            className: "!text-white !bg-blue-400 !outline-none !border-none",
            classNames:{
              actionButton: "!text-white hover:!text-white ",
              icon: "!text-white ",
              description: "!text-white ",
              title: "!text-white !font-bold !text-xs",
              toast: "!text-white !bg-blue-400 !outline-none !border-none",
              error: "!text-white !bg-red-400 !outline-none !border-none",
              success: "!text-white !bg-green-400 !outline-none !border-none",
              info: "!text-white !bg-yellow-400 !outline-none !border-none",
              warning: "!text-white !bg-orange-400 !outline-none !border-none",
              loading: "!text-white !bg-purple-400 !outline-none !border-none",

            }
          }
          }
        /> {/* For Shadcn toasts */}
        {process.env.NODE_ENV === "development" && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </ServiceWorkerProvider>
    </QueryClientProvider>
  );
}
