"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  speed: 500,
  minimum: 0.1,
  trickleSpeed: 200,
});

/**
 * TopLoader Component
 * 
 * Automatically shows a top loading bar during route changes in Next.js App Router.
 * 
 * Features:
 * - Shows loading bar when navigating between pages
 * - Shows loading bar when URL search parameters change
 * - Skips loading indicator on first page load
 * - Styled to match the app's blue theme
 * 
 * Usage:
 * - Already integrated in root layout
 * - For programmatic navigation with loading, use the useTopLoader hook
 * 
 * Example with useTopLoader hook:
 * ```tsx
 * import { useTopLoader } from "@/hooks/useTopLoader";
 * 
 * function MyComponent() {
 *   const { push, replace } = useTopLoader();
 *   
 *   const handleNavigation = () => {
 *     push("/dashboard/chat"); // Shows loading bar
 *   };
 * }
 * ```
 */
export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip loading indicator on first render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Start loading when pathname or searchParams change
    NProgress.start();

    // Complete loading after a short delay
    const timer = setTimeout(() => {
      NProgress.done();
    }, 200);

    return () => {
      clearTimeout(timer);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      NProgress.done();
    };
  }, []);

  return null;
}
