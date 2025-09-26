"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NProgress from "nprogress";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  speed: 500,
  minimum: 0.1,
  trickleSpeed: 200,
});

export function useTopLoader() {
  const router = useRouter();

  // Enhanced router methods with loading indicators
  const pushWithLoader = (href: string) => {
    NProgress.start();
    router.push(href);
  };

  const replaceWithLoader = (href: string) => {
    NProgress.start();
    router.replace(href);
  };

  const backWithLoader = () => {
    NProgress.start();
    router.back();
  };

  const forwardWithLoader = () => {
    NProgress.start();
    router.forward();
  };

  return {
    push: pushWithLoader,
    replace: replaceWithLoader,
    back: backWithLoader,
    forward: forwardWithLoader,
  };
}
