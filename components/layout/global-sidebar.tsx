// src/components/layout/global-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Power, RadioTower } from "lucide-react"; // For Online/Offline status toggle

import { cn } from "@/lib/utils";
import { User } from "@/types";
import { dashboardNavItems, NavItem } from "@/config/dashboard-nav";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuthActions, useCurrentUser } from "@/stores/auth";
import { useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch"; // For Online/Offline
import { Label } from "@/components/ui/label"; // For Online/Offline
import { useState } from "react"; // For local UI state of online status

interface GlobalSidebarProps {
  currentUser: User | null; // Pass the current user to determine role
  className?: string;
}

export function GlobalSidebar({ currentUser, className }: GlobalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthActions();
  const queryClient = useQueryClient();

  // Local state for online/offline toggle (actual logic via WebSocket/API later)
  const [isOnline, setIsOnline] = useState(true);

  const handleLogout = () => {
    logout();
    queryClient.clear();
    router.push("/login");
  };

  const handleStatusChange = (checked: boolean) => {
    setIsOnline(checked);
    // TODO: Implement actual API/WebSocket call to update status
    console.log(`User status changed to: ${checked ? "Online" : "Offline"}`);
  };

  if (!currentUser) {
    return null; // Or a loading skeleton
  }

  const visibleNavItems = dashboardNavItems.filter(
    (item) => !item.role || item.role === currentUser.role
  );

  return (
    <motion.aside
      initial={{ x: -280 }} // Assuming sidebar width of 280px
      animate={{ x: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r bg-background",
        className
      )}
    >
      <div className="flex h-16 items-center justify-center border-b px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-primary"
        >
          SupportDash
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <nav className="grid items-start gap-1 px-4 py-4">
          {visibleNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname.startsWith(item.href);

            return (
              item.href && (
                <div key={index}>
                  {item.separator && <Separator className="my-3" />}
                  <Link href={item.href}>
                    <Button
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start",
                        isActive && "font-semibold"
                      )}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.title}
                      {item.label && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          {item.label}
                        </span>
                      )}
                    </Button>
                  </Link>
                </div>
              )
            );
          })}
        </nav>
      </ScrollArea>

      <div className="mt-auto border-t p-4">
        {currentUser.role === "AGENT" || currentUser.role === "ADMIN" ? (
          <div className="flex items-center space-x-2 mb-4 p-2 rounded-md border">
            <RadioTower
              className={`h-5 w-5 ${
                isOnline ? "text-green-500" : "text-red-500"
              }`}
            />
            <Label htmlFor="online-status-toggle" className="flex-grow text-sm">
              {isOnline ? "Online" : "Offline"}
            </Label>
            <Switch
              id="online-status-toggle"
              checked={isOnline}
              onCheckedChange={handleStatusChange}
              aria-label="Toggle online status"
            />
          </div>
        ) : null}

        <div className="mb-2">
          <p className="text-sm font-medium leading-none">
            {currentUser.firstName} {currentUser.lastName}
          </p>
          <p className="text-xs leading-none text-muted-foreground">
            {currentUser.email} ({currentUser.role})
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </motion.aside>
  );
}
