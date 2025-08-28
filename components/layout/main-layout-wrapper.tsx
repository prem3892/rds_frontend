"use client"

import type React from "react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
} from "@/components/ui/sidebar"
import {
  Home,
  Users,
  MessageSquare,
  UserCheck,
  Globe,
  Mail,
  MessageCircle,
  UserX,
  LogOut,
  ChevronDown,
  RadioTower,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useSocketOperations } from "@/hooks/useSocket"
import { useAuthActions, useIsOnline } from "@/stores"
import { useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { socketService } from "@/services/socketService"

interface DashboardLayoutProps {
  currentScreen: string
  children?: React.ReactNode
}

export function MainLayoutWrapper({ currentScreen, children }: DashboardLayoutProps) {
  const { setOnlineStatus } = useSocketOperations();
  const { logout, setOnlineStatus: setAuthOnlineStatus } = useAuthActions();
  const isOnline = useIsOnline();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  // Listen for online status updates from server
  useEffect(() => {
    const removeListener = socketService.addListener((event, data) => {
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
    { icon: Home, label: "Dashboard", href: "/dashboard/chat", active: currentScreen === "Dashboard" },
    { icon: Users, label: "Contacts", href: "/contacts", active: currentScreen === "Contacts" },
    { icon: MessageSquare, label: "Chat History", href: "/dashboard/history", active: currentScreen === "Chat History" },
    { icon: UserCheck, label: "Agents", href: "/agents", active: currentScreen === "Agents" },
    { icon: Globe, label: "Domains", href: "/domains", active: currentScreen === "Domains" },
    { icon: Mail, label: "Canned Messages", href: "/canned-messages", active: currentScreen === "Canned Messages" },
    { icon: MessageCircle, label: "Auto Message", href: "/auto-message", active: currentScreen === "Auto Message" },
    { icon: UserX, label: "Blocked Guests", href: "/blocked-guests", active: currentScreen === "Blocked Guests" },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar className="border-r-0">
          <div className="flex h-full flex-col bg-gradient-to-b from-[#00398F] to-[#001433]">
            <SidebarHeader className="p-6">
              <div className="flex items-center gap-2">
                 <Image
                src={"/convoia-logo.svg"}
                alt="logo"
                height={80}
                width={100}
                />
              </div>
            </SidebarHeader>

            <SidebarContent className="px-4">
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.label}>
                    <Link href={item.href}>
                      <SidebarMenuButton
                        className={`w-full justify-start gap-3 px-4 py-3 text-white hover:bg-white/10 ${
                          item.active ? "bg-white/20" : ""
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                    </Link>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarContent>

            <SidebarFooter className="p-4">
              
                <SidebarMenuButton
                onClick={handleLogout}
                className="w-full justify-start gap-3 px-4 py-3 text-white hover:bg-white/10">
                  <LogOut className="h-5 w-5" />
                  <span>Log Out</span>
                </SidebarMenuButton>
            
            </SidebarFooter>
          </div>
        </Sidebar>

        <div className="flex flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 items-center justify-between bg-white px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <h1 className="text-2xl font-semibold text-gray-900">{currentScreen}</h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Online/Offline Toggle */}
              <div className="flex bg-gray-100 rounded-full p-1">
                <button
                  onClick={() => handleStatusChange(true)}
                  disabled={isStatusLoading}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    isOnline
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800",
                    isStatusLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isStatusLoading && isOnline && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Online
                </button>
                <button
                  onClick={() => handleStatusChange(false)}
                  disabled={isStatusLoading}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    !isOnline
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-gray-600 hover:text-gray-800",
                    isStatusLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {isStatusLoading && !isOnline && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Offline
                </button>
              </div>

              {/* Profile Section */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/professional-headshot.png" alt="Cameron Williamson" />
                      <AvatarFallback>CW</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-start text-sm">
                      <span className="font-medium">Cameron Williamson</span>
                      <span className="text-gray-500">williamson@gmail.com</span>
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
          <main className="flex-1 overflow-auto bg-white p-6">
            {children || (
              <div className="flex h-full items-center justify-center text-gray-500">
                <p>Main content area - Dashboard components will go here</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
