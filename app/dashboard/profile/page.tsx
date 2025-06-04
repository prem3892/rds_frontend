// src/app/(dashboard)/profile/page.tsx
"use client";
import { useCurrentUser } from "@/stores/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const currentUser = useCurrentUser();

  if (!currentUser) return <p>Loading...</p>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">My Profile</CardTitle>
          <CardDescription>
            View and manage your profile settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Full Name
            </p>
            <p>
              {currentUser.firstName} {currentUser.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{currentUser.email}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Role</p>
            <p>{currentUser.role}</p>
          </div>
          {/* Add forms for updating password, maxConcurrentChats (for agents) later */}
        </CardContent>
      </Card>
    </motion.div>
  );
}
