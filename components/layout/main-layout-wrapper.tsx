"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useSocketOperations } from "@/hooks/useSocket";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { cn } from "@/lib/utils";
import { socketService } from "@/services/socketService";
import { useAuthActions, useIsOnline, useCurrentUser } from "@/stores";
import { logoutUser } from "@/lib/token-refresh";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Globe,
  Loader2,
  LogOut,
  Mail,
  MessageCircle,
  MessageSquare,
  UserCheck,
  Users,
  UserX,
  WifiOff,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { HomeIcon } from "../icons";
import { MobileStatusSwitch } from "../mobile-toggle-switch";
import { Separator } from "../ui/separator";
import {
  useGetMyAgentProfile,
  useSetAgentStatusMutation,
} from "@/lib/agent.api";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";

// Utility function to get screen name based on route
const getScreenNameFromRoute = (pathname: string): string => {
  const routeMap: Record<string, string> = {
    "/dashboard": "Overview",
    "/dashboard/chat": "Dashboard",
    "/dashboard/history": "Chat History",
    "/dashboard/widgets": "Domains",
    "/dashboard/(admin)/widgets": "Domains",
    "/dashboard/(admin)/agents": "Agents",
    "/dashboard/(admin)/departments": "Departments",
    "/dashboard/(admin)/sessions": "Sessions",
    "/dashboard/users": "User Management",
    "/dashboard/profile": "Profile",
    "/dashboard/contacts": "Contacts",
    "/dashboard/agents": "Agents",
    "/dashboard/canned-messages": "Canned Messages",
    "/dashboard/auto-messages": "Auto Message",
    "/dashboard/blocked-customers": "Blocked Guests",
  };

  // Check for exact matches first
  if (routeMap[pathname]) {
    return routeMap[pathname];
  }

  // Check for partial matches (for nested routes)
  for (const [route, screenName] of Object.entries(routeMap)) {
    if (pathname.startsWith(route)) {
      return screenName;
    }
  }

  // Default fallback
  return "Dashboard";
};

interface DashboardLayoutProps {
  currentScreen?: string; // Make it optional since we'll auto-determine it
  children?: React.ReactNode;
}

export function MainLayoutWrapper({
  currentScreen,
  children,
}: DashboardLayoutProps) {
  const { logout } = useAuthActions();
  const { isOnline, setOnlineStatus } = useOnlineStatus();
  const setOnlineStatusMutation = useSetAgentStatusMutation();
  const currentUser = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const pathname = usePathname();
  const { data: agentProfile, isLoading, error } = useGetMyAgentProfile();

  // Auto-determine current screen based on route if not provided
  const screenTitle = useMemo(() => {
    return currentScreen || getScreenNameFromRoute(pathname);
  }, [currentScreen, pathname]);

  // Listen for online status updates from server
  useEffect(() => {
    const removeListener = socketService.addListener((event) => {
      if (event === "onlineStatusUpdated") {
        setIsStatusLoading(false);
      }
    });

    return () => {
      removeListener();
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Use the logoutUser function which handles:
      // 1. Calling backend /auth/logout endpoint
      // 2. Clearing frontend auth state
      // 3. Clearing React Query cache
      // 4. Redirecting to login
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: clear local state and redirect even if backend call fails
      logout();
      queryClient.clear();
      router.push("/login");
    }
  };

  const handleStatusChange = (checked: boolean) => {
    try {
      setIsStatusLoading(true);

      // setOnlineStatusMutation.mutateAsync({
      //   isOnline: checked,
      // }).catch((error) => {
      //   console.error('Status update failed:', error);
      // });

      // Use the new hook which handles both local state and server sync
      setOnlineStatus(checked);
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setIsStatusLoading(false);
    }
    // Set loading state

    // setOnlineStatusMutation.mutateAsync({
    //   isOnline: checked,
    // }).catch((error) => {
    //   console.error('Status update failed:', error);
    // });

    // setIsStatusLoading(false);
  };

  const allMenuItems = [
    {
      icon: HomeIcon,
      label: "Dashboard",
      href: "/dashboard/chat",
      active: pathname.includes("/chat"),
      roles: ["ADMIN", "AGENT"], // Available to both roles
    },
    {
      icon: Users,
      label: "Contacts",
      href: "/dashboard/contacts",
      active: pathname.includes("/contacts"),
      roles: ["ADMIN", "AGENT"], // Available to both roles
    },
    {
      icon: MessageSquare,
      label: "Chat History",
      href: "/dashboard/history",
      active: pathname.includes("/history"),
      roles: ["ADMIN", "AGENT"], // Available to both roles
    },
    {
      icon: UserCheck,
      label: "Agents",
      href: "/dashboard/agents",
      active: pathname.includes("/agents"),
      roles: ["ADMIN"], // Admin only
    },
    {
      icon: Globe,
      label: "Domains",
      href: "/dashboard/widgets",
      active: pathname.includes("/widgets"),
      roles: ["ADMIN"], // Admin only
    },
    {
      icon: Mail,
      label: "Canned Messages",
      href: "/dashboard/canned-messages",
      active: pathname.includes("/canned-messages"),
      roles: ["ADMIN", "AGENT"], // Available to both roles
    },
    {
      icon: MessageCircle,
      label: "Auto Message",
      href: "/dashboard/auto-messages",
      active: pathname.includes("/auto-messages"),
      roles: ["ADMIN", "AGENT"], // Available to both roles
    },
    {
      icon: UserX,
      label: "Blocked Guests",
      href: "/dashboard/blocked-customers",
      active: pathname.includes("/blocked-customers"),
      roles: ["ADMIN"], // Admin only
    },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    if (!currentUser?.role) return false; // Hide all items if no user role
    return item.roles.includes(currentUser.role);
  });

  return (
    <SidebarProvider>
    <div className="flex h-screen w-full overflow-hidden">
      <Sidebar
        className="border-r-0 bg-white rounded-3xl group-data-[collapsible=icon]:rounded-xl outline-none border-none flex-shrink-0 p-4 px-2 group-data-[collapsible=icon]:p-3 group-data-[collapsible=icon]:px-2"
        collapsible="icon"
        style={{"--sidebar-width-icon": "4.5rem"} as React.CSSProperties}
      >
        <div className="flex h-full flex-col rounded-3xl group-data-[collapsible=icon]:rounded-xl bg-gradient-to-b from-[#00398F] to-[#001433]">
          <SidebarHeader className="p-4 sm:p-6 rounded-t-3xl group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:rounded-t-xl">
            <div className="flex flex-col items-center gap-2 justify-center pb-2 group-data-[collapsible=icon]:pb-1">
              <div className="group-data-[collapsible=icon]:hidden">
                <Image
                  src={"/convoia-logo.svg"}
                  alt="logo"
                  height={80}
                  width={100}
                  className="w-32 flex-shrink-0 align-middle"
                />
              </div>
              <div className="hidden group-data-[collapsible=icon]:block">
                <Image
                  src={"/convoia-short-logo.svg"}
                  alt="logo"
                  height={32}
                  width={32}
                  className="w-8 h-8 flex-shrink-0"
                />
              </div>
              <Separator
                orientation="horizontal"
                className="outline-none border-0 h-full bg-gradient-to-r from-[#D6DEEF00] via-[#fff] to-[#D6DEEF00] group-data-[collapsible=icon]:hidden"
              />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 sm:px-4 group-data-[collapsible=icon]:px-2">
            <SidebarMenu className="h-full px-4 flex flex-col gap-4 group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:gap-3">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <Link href={item.href}>
                    <SidebarMenuButton
                      tooltip={item.label}
                      className={`w-full justify-start gap-4 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-white hover:bg-white/10 hover:text-white group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:min-h-10 ${
                        item.active ? "bg-white/20 text-white" : ""
                      }`}
                    >
                      <item.icon className="text-white flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="truncate text-xl md:text-base group-data-[collapsible=icon]:hidden">
                        {item.label}
                      </span>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-2 sm:p-4 rounded-b-3xl group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:rounded-b-xl">
            <SidebarMenuButton
              tooltip="Log Out"
              onClick={handleLogout}
              className="w-full justify-start gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-white hover:bg-white/10 hover:text-white hover:no-underline group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:w-10 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:min-h-10"
            >
              <LogOut className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
              <span className="truncate text-sm sm:text-base group-data-[collapsible=icon]:hidden">Log Out</span>
            </SidebarMenuButton>
          </SidebarFooter>
        </div>
      </Sidebar>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between bg-white px-3 sm:px-4 md:px-6 overflow-hidden">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <SidebarTrigger className="flex-shrink-0" />
            <div className="block md:hidden">
              <Image
                src={"/ConvoiaChat-logo-horizontal-white-bg.svg"}
                alt="logo"
                height={40}
                width={120}
                className="h-10 w-30"
              />
            </div>
            <h1 className="hidden md:block text-xl md:text-3xl font-semibold text-gray-900 truncate">
              {screenTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            {/* Online/Offline Toggle */}
            <div className="hidden sm:flex bg-gray-100 rounded-full p-1 flex-shrink-0">
              <Button
                onClick={() => handleStatusChange(true)}
                disabled={isStatusLoading}
                variant={"ghost"}
                className={cn(
                  "px-2 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  isOnline
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-600/90 hover:text-white"
                    : "text-gray-600 hover:text-gray-800",
                  isStatusLoading && "opacity-50 cursor-not-allowed",
                )}
              >
                {isStatusLoading && isOnline && <Loader2 className="h-4 w-4 animate-spin" />}
                Online
              </Button>
              <Button
                onClick={() => handleStatusChange(false)}
                disabled={isStatusLoading}
                variant={"ghost"}
                className={cn(
                  "px-2 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                  !isOnline
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-600/90 hover:text-white"
                    : "text-gray-600 hover:text-gray-800",
                  isStatusLoading && "opacity-50 cursor-not-allowed",
                )}
              >
                {isStatusLoading && !isOnline && <Loader2 className="h-4 w-4 animate-spin" />}
                Offline
              </Button>
            </div>
            <div className="sm:hidden">
              <MobileStatusSwitch
                isOnline={isOnline}
                isStatusLoading={isStatusLoading}
                handleStatusChange={handleStatusChange}
              />
            </div>

            {/* Profile Section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-4">
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={`${process.env.NEXT_PUBLIC_API_URL}${agentProfile?.profilePicture}`}
                      alt={currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : "User"}
                    />
                    <AvatarFallback>
                      {agentProfile?.user.firstName ? `${agentProfile?.user.firstName[0]}${agentProfile?.user.lastName?.[0] || ""}` : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:flex flex-col items-start justify-center text-sm min-w-0">
                    <span className="font-medium truncate capitalize">
                      {agentProfile?.user.firstName ? `${agentProfile?.user.firstName} ${agentProfile?.user.lastName}` : "User"}
                    </span>
                  </div>
                  <Badge variant={"outline"} className="rounded-full text-xs text-primary">
                    {currentUser?.role || "USER"}
                  </Badge>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => router.push("/dashboard/profile")}>Profile Settings</DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Offline Status Alert */}
        {!isOnline && (
          <div className="flex justify-center px-4 py-2 bg-white">
            <Alert className="max-w-md bg-red-50 border-red-200 text-red-800">
              <WifiOff className="h-4 w-4" />
              <AlertDescription className="font-medium">
                You are currently offline. Switch to online mode to receive new chats and messages.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto bg-white p-2 sm:p-3 md:p-4 lg:p-5">{children}</main>
      </div>
    </div>
  </SidebarProvider>
  );
}
