// src/components/layout/global-sidebar.tsx
"use client";

import { motion } from "framer-motion";
import { ChevronLeft, LogOut, Menu, RadioTower } from "lucide-react"; // For Online/Offline status toggle
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // For Online/Offline
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch"; // For Online/Offline
import { dashboardNavItems } from "@/config/dashboard-nav";
import { cn } from "@/lib/utils";
import { useAuthActions, useIsOnline } from "@/stores/auth";
import { useSharedActions, useSidebarExpanded } from "@/stores/shared";
import { User } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

import { useSocketOperations } from "@/hooks/useSocket";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import Image from "next/image";

interface GlobalSidebarProps {
  currentUser: User | null; // Pass the current user to determine role
  className?: string;
}

export function GlobalSidebar({ currentUser, className }: GlobalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuthActions();
  const { toggleSidebar } = useSharedActions();
  const { isOnline, setOnlineStatus } = useOnlineStatus();
  const sidebarExpanded = useSidebarExpanded();
  const queryClient = useQueryClient();

  const handleLogout = () => {
    logout();
    queryClient.clear();
    router.push("/login");
  };

  const handleStatusChange = (checked: boolean) => {
    // Use the new hook which handles both local state and server sync
    setOnlineStatus(checked);
  };

  if (!currentUser) {
    return null; // Or a loading skeleton
  }

  const visibleNavItems = dashboardNavItems.filter(
    (item) => !item.role || item.role === currentUser.role
  );

  return (
    <motion.aside
      initial={{ width: sidebarExpanded ? 240 : 64 }}
      animate={{ width: sidebarExpanded ? 240 : 64 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        " left-0 text-white top-0 z-40 flex h-screen flex-col border-r bg-gradient-to-b from-[#00398F] to-[#001433]",
        className
      )}
    >
      <div className="flex h-16 items-center  px-4 justify-between">
        {sidebarExpanded ? (
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-primary"
          >
            <Image
              width={110}
              height={100}
              alt=""
              src="/brand_logo_convoia_assist.png"
            />
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className="text-xl font-bold tracking-tight text-primary"
          >
            <Image
              width={32}
              height={32}
              alt=""
              src="/brand_logo_convoia_assist.png"
              className="object-contain"
            />
          </Link>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className="h-8 w-8 p-0"
        >
          {sidebarExpanded ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <Menu className="h-4 w-4" />
          )}
        </Button>
      </div>
      <div className="px-3">
        <Separator orientation="horizontal" className="px-3 w-" />
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
                        "w-full text-base  font-normal",
                        sidebarExpanded
                          ? "justify-start"
                          : "justify-center px-2",
                        isActive && "font-semibold"
                      )}
                      title={!sidebarExpanded ? item.title : undefined}
                    >
                      <Icon className={cn("size-5", sidebarExpanded && "")} />
                      {sidebarExpanded && (
                        <>
                          {item.title}
                          {item.label && (
                            <span className="ml-auto text-xs text-muted-foreground">
                              {item.label}
                            </span>
                          )}
                        </>
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
        {currentUser.role === "AGENT" ||
        currentUser.role === "ADMIN" ||
        currentUser.role === "MANAGER" ? (
          <div className="mb-4">
            {sidebarExpanded ? (
              <div className="flex items-center space-x-2 p-2 rounded-md border">
                <RadioTower
                  className={`h-5 w-5 ${
                    isOnline ? "text-green-500" : "text-red-500"
                  }`}
                />
                <Label
                  htmlFor="online-status-toggle"
                  className="flex-grow text-sm"
                >
                  {isOnline ? "Online" : "Offline"}
                </Label>
                <Switch
                  id="online-status-toggle"
                  checked={isOnline}
                  onCheckedChange={handleStatusChange}
                  aria-label="Toggle online status"
                />
              </div>
            ) : (
              <div className="relative group">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStatusChange(!isOnline)}
                  className={cn(
                    "w-full h-10 p-0 rounded-lg border-2 transition-all duration-200",
                    isOnline
                      ? "border-green-500/30 bg-green-500/10 hover:bg-green-500/20"
                      : "border-red-500/30 bg-red-500/10 hover:bg-red-500/20"
                  )}
                  title={
                    isOnline ? "Click to go Offline" : "Click to go Online"
                  }
                >
                  <div className="relative">
                    <RadioTower
                      className={cn(
                        "h-5 w-5 transition-all duration-200",
                        isOnline ? "text-green-500" : "text-red-500"
                      )}
                    />
                    {/* Animated pulse dot for online status */}
                    {isOnline && (
                      <div className="absolute -top-1 -right-1">
                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                        <div className="absolute inset-0 h-2 w-2 bg-green-500 rounded-full animate-ping opacity-75"></div>
                      </div>
                    )}
                  </div>
                </Button>

                {/* Tooltip on hover */}
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className="bg-popover text-popover-foreground px-2 py-1 rounded-md text-xs whitespace-nowrap border shadow-md">
                    {isOnline
                      ? "Online - Click to go Offline"
                      : "Offline - Click to go Online"}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 border-4 border-transparent border-r-popover"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {sidebarExpanded ? (
          <div className="mb-2">
            <p className="text-sm font-medium leading-none">
              {currentUser.firstName} {currentUser.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email} ({currentUser.role})
            </p>
          </div>
        ) : null}

        <Button
          variant="outline"
          className={cn("w-full", !sidebarExpanded && "px-2")}
          onClick={handleLogout}
          title={!sidebarExpanded ? "Logout" : undefined}
        >
          <LogOut className={cn("h-4 w-4", sidebarExpanded && "mr-2")} />
          {sidebarExpanded && "Logout"}
        </Button>
      </div>
    </motion.aside>
  );
}
