"use client";



import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Since middleware handles authentication server-side,
    // we can redirect immediately without checking client state
    // The middleware will handle the actual authentication check
    router.replace("/dashboard/chat");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting...</p>
    </div>
  );
}
