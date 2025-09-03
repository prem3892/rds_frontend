"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { cn } from "@/lib/utils";
import { socketService } from "@/services/socketService";
import { useAuthActions, useIsOnline } from "@/stores";
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
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { HomeIcon } from "../icons";
import { MobileStatusSwitch } from "../mobile-toggle-switch";
import { Separator } from "../ui/separator";

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
    "/dashboard/auto-message": "Auto Message",
    "/dashboard/blocked-guests": "Blocked Guests",
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
  const { setOnlineStatus } = useSocketOperations();
  const { logout, setOnlineStatus: setAuthOnlineStatus } = useAuthActions();
  const isOnline = useIsOnline();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const pathname = usePathname();

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

  const handleLogout = () => {
    logout();
    queryClient.clear();
    router.push("/login");
  };

  const handleStatusChange = (checked: boolean) => {
    // Set loading state
    setIsStatusLoading(true);

    // Optimistically update the UI immediately
    setAuthOnlineStatus(checked);
    // Send the status change to the server
    setOnlineStatus(checked);
  };

  const menuItems = [
    {
      icon: HomeIcon,
      label: "Dashboard",
      href: "/dashboard/chat",
      active: pathname.includes("/chat"),
    },
    {
      icon: Users,
      label: "Contacts",
      href: "/dashboard/contacts",
      active: pathname.includes("/contacts"),
    },
    {
      icon: MessageSquare,
      label: "Chat History",
      href: "/dashboard/history",
      active: pathname.includes("/history"),
    },
    {
      icon: UserCheck,
      label: "Agents",
      href: "/dashboard/agents",
      active: pathname.includes("/agents"),
    },
    {
      icon: Globe,
      label: "Domains",
      href: "/dashboard/widgets",
      active: pathname.includes("/widgets"),
    },
    {
      icon: Mail,
      label: "Canned Messages",
      href: "/dashboard/canned-messages",
      active: pathname.includes("/canned-messages"),
    },
    {
      icon: MessageCircle,
      label: "Auto Message",
      href: "/dashboard/auto-messages",
      active: pathname.includes("/auto-messages"),
    },
    {
      icon: UserX,
      label: "Blocked Guests",
      href: "/dashboard/blocked-guests",
      active: pathname.includes("/blocked-guests"),
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar className="border-r-0 p-4 px-2 bg-white outline-none border-none flex-shrink-0">
          <div className="flex h-full flex-col rounded-3xl bg-gradient-to-b from-[#00398F] to-[#001433]">
            <SidebarHeader className="p-4 sm:p-6">
              <div className="flex flex-col items-center gap-2 justify-center  pb-2">
                <Image
                  src={"/convoia-logo.svg"}
                  alt="logo"
                  height={80}
                  width={100}
                  className="w-32 flex-shrink-0 align-middle "
                />
                <Separator orientation="horizontal" className=" outline-none border-0 h-full bg-gradient-to-r from-[#D6DEEF00] via-[#fff] to-[#D6DEEF00]" />
              </div>
            </SidebarHeader>

            <SidebarContent className="px-2 sm:px-4">
               <SidebarMenu className=" h-full px-4  flex flex-col gap-4">
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <Link href={item.href}>
                      <SidebarMenuButton
                        className={`w-full justify-start gap-4 sm:gap-3 px-2 sm:px-3 md:px-4  py-2 sm:py-3 text-white hover:bg-white/10 hover:text-white ${
                          item.active ? "bg-white/20 text-white" : ""
                        }`}
                      >
                        <item.icon className="  text-white flex-shrink-0  " />
                        <span className="truncate text-xl md:text-base">{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-2 sm:p-4">
              <SidebarMenuButton
                onClick={handleLogout}
                className="w-full justify-start gap-2 sm:gap-3 px-2 sm:px-3 md:px-4 py-2 sm:py-3 text-white hover:bg-white/10 hover:text-white hover:no-underline"
              >
                <LogOut className="h-4 sm:h-5 w-4 sm:w-5 flex-shrink-0" />
                <span className="truncate text-sm sm:text-base">Log Out</span>
              </SidebarMenuButton>
            </SidebarFooter>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center justify-between bg-white px-3 sm:px-4 md:px-6 overflow-hidden">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <SidebarTrigger className=" flex-shrink-0" />
              {/* Show logo on mobile, title on larger screens */}
              <div className="block md:hidden">
                <Image
                  src={"/ConvoiaChat-logo-horizontal-white-bg.svg"}
                  alt="logo"
                  height={100}
                  width={100}
                  className="h-16 w-32"
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
                    isStatusLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isStatusLoading && isOnline && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
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
                    isStatusLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isStatusLoading && !isOnline && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
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
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 p-2 flex-shrink-0"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="/professional-headshot.png"
                        alt="Cameron Williamson"
                      />
                      <AvatarFallback>CW</AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col items-start text-sm min-w-0">
                      <span className="font-medium truncate">Cameron Williamson</span>
                      <span className="text-gray-500 truncate">
                        williamson@gmail.com
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Account Settings</DropdownMenuItem>
                  <DropdownMenuItem>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-auto bg-white p-2 sm:p-3 md:p-4 lg:p-5 mobile-no-overflow">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
