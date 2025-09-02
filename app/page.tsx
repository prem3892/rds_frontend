// src/app/page.tsx
"use client";

import { useIsAuthenticated } from "@/stores/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  // const currentUser = useCurrentUser(); // Not strictly needed here anymore for role-based redirect

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard"); // All authenticated users go to /dashboard
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading...</p>
    </div>
  );
}
