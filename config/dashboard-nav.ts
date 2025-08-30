// src/config/dashboard-nav.ts
import {
  Users,
  MessageSquare,
  Settings,
  UserCog,
  ShieldAlert,
  LayoutDashboard,
  LogOut,
  Building,
  History,
  CircleUserRound,
  Power,
  FileText,
} from "lucide-react"; // Example icons from lucide-react

export type NavItem = {
  title: string;
  href: string;
  icon: React.ElementType;
  role?: "ADMIN" | "AGENT"; // If undefined, visible to all authenticated users within dashboard
  isExternal?: boolean;
  label?: string;
  children?: NavItem[]; // For nested navigation if needed in future
  separator?: boolean; // To add a visual separator before this item
};

export const dashboardNavItems: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "My Chats", // Or "Active Chats"
    href: "/dashboard/chat",
    icon: MessageSquare,
  },
  {
    title: "Chat History", // User's own chat history
    href: "/dashboard/history",
    icon: History,
  },
  {
    title: "User Management",
    href: "/dashboard/users",
    icon: Users,
    role: "ADMIN",
    separator: true,
  },
  {
    title: "Widgets",
    href: "/dashboard/widgets",
    icon: Building,
    role: "ADMIN",
  },
  {
    title: "Agent Settings", // Specific agent settings (can be part of User Management too)
    href: "/dashboard/agents",
    icon: UserCog,
    role: "ADMIN",
  },
  {
    title: "Departments",
    href: "/dashboard/departments",
    icon: Building,
    role: "ADMIN",
  },
  {
    title: "Canned Messages",
    href: "/dashboard/canned-messages",
    icon: FileText,
  },
  {
    title: "All Chat Sessions", // Admin monitoring
    href: "/dashboard/sessions",
    icon: ShieldAlert,
    role: "ADMIN",
  },
  {
    title: "My Profile",
    href: "/dashboard/profile",
    icon: CircleUserRound,
    separator: true,
  },
  // Set Online/Offline status will likely be a toggle in the header or user menu, not a nav item.
];
