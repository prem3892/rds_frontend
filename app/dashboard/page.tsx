// src/app/(dashboard)/page.tsx
"use client";

import { useCurrentUser, useHasHydrated } from "@/stores/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardOverviewPage() {
  const currentUser = useCurrentUser();
  const hasHydrated = useHasHydrated();

  if (!hasHydrated || !currentUser) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 bg-gray-200 rounded" />
          <Skeleton className="h-4 w-96 bg-gray-200 rounded" />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-24 bg-gray-200 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <h1 className="text-3xl font-bold tracking-tight">
        Welcome, {currentUser.firstName}!
      </h1>
      <p className="text-muted-foreground">
        This is your dashboard overview. Select an option from the sidebar to
        get started.
      </p>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Your Role</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{currentUser.role}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-500">Online</p>{" "}
            {/* Placeholder */}
          </CardContent>
        </Card>
        {/* Add more summary cards as needed */}
      </div>

      {/* Future content: Quick access to active chats, notifications, etc. */}
    </motion.div>
  );
}
