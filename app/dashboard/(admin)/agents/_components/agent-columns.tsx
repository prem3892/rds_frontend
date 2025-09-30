"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AgentProfile } from "@/lib/agent.api";
import { Department } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import {
  Building,
  Edit,
  Globe,
  Mail,
  MoreHorizontal,
  Settings,
  ToggleLeft,
  User,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import CellAction from "./cell-actions";

interface AgentColumnsProps {
  departments: Department[];
  onEdit: (agent: AgentProfile) => void;
  onToggleStatus: (agent: AgentProfile) => void;
  onBlockAgent: (agent: AgentProfile, isBlocked: boolean) => void;
  blockLoadingAgentId?: string | null;
  statusLoadingAgentId?: string | null;
}

// Helper function to get the full image URL
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return undefined;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  return `${API_BASE_URL}${imagePath}`;
};

export const createAgentColumns = ({ 
  departments, 
  onEdit,
  onToggleStatus,
  onBlockAgent,
  blockLoadingAgentId,
  statusLoadingAgentId 
}: AgentColumnsProps): ColumnDef<AgentProfile>[] => [
  {
    accessorKey: "name",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <User className="size-5 stroke-1" />
          <span>Name</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <div className="flex items-center space-x-3  ">
          <div className="relative">
          <Avatar className="h-8 w-8 ">
            <AvatarImage 
              src={agent.profilePicture ? getFullImageUrl(agent.profilePicture) : undefined} 
              alt={`${agent.user.firstName} ${agent.user.lastName}`} 
            />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
              {agent.user.firstName[0]}{agent.user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 -right-1  bg-white rounded-full p-0.5">
          <div className={cn("w-2 h-2 rounded-full", agent.isOnline ? "bg-green-500" : "bg-red-500")} />
        </div>
          </div>
        
          <span className="font-medium capitalize">
            {agent.user.firstName} {agent.user.lastName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Mail className="size-5 stroke-1" />
          <span>Email</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <div className="flex items-center space-x-2">
          <span>{agent.user.email}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "departments",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Building className="size-5 stroke-1" />
          <span>Departments</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Building className="h-4 w-4 text-gray-500" />
          <div className="flex flex-wrap gap-1">
            {agent.departmentIds.length > 0 ? (
              Array.isArray(agent.departmentIds) &&
              typeof agent.departmentIds[0] === "object" ? (
                // Handle case where departmentIds is an array of department objects
                agent.departmentIds.map((dept: any) => (
                  <Badge key={dept._id} variant="outline" className="text-xs">
                    {dept.name}
                  </Badge>
                ))
              ) : (
                // Handle case where departmentIds is an array of IDs
                departments
                  ?.filter((dept: Department) =>
                    agent.departmentIds.includes(dept._id)
                  )
                  .map((dept: Department) => (
                    <Badge key={dept._id} variant="outline" className="text-xs">
                      {dept.name}
                    </Badge>
                  ))
              )
            ) : (
              <span className="text-muted-foreground text-sm">None</span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "domainAccess",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Globe className="size-5 stroke-1" />
          <span>Domain Access</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <div className="flex items-center space-x-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <div className="flex flex-wrap gap-1">
            {agent.domainAccess && agent.domainAccess.length > 0 ? (
              agent.domainAccess.map((domain, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {domain}
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground text-sm">All domains</span>
            )}
          </div>
        </div>
      );
    },
  },
  // {
  //   accessorKey: "status",
  //   header: () => {
  //     return (
  //       <div className="flex items-center gap-2">
  //         <Settings className="size-5 stroke-1" />
  //         <span>Status</span>
  //       </div>
  //     )
  //   },
  //   cell: ({ row }) => {
  //     const agent = row.original;
  //     return (
  //       <div className="flex items-center justify-start">
  //         <Badge
  //           variant={agent.isOnline ? "default" : "secondary"}
  //           className="font-normal"
  //         >
  //           {agent.isOnline ? "Online" : "Offline"}
  //         </Badge>
  //       </div>
  //     );
  //   },
  // },
  {
    accessorKey: "role",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Shield className="size-5 stroke-1" />
          <span>Role</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const agent = row.original;
      const role = agent.user?.role || "AGENT";
      const formatted = role.charAt(0) + role.slice(1).toLowerCase();
      return (
        <div className="flex items-center justify-start space-x-2">
          <Badge variant="outline">
            {formatted}
          </Badge>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <MoreHorizontal className="size-5 stroke-1" />
          <span>Actions</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return (
        <CellAction
          row={row}
          onEdit={onEdit}
          onToggleStatus={onToggleStatus}
          onBlockAgent={onBlockAgent}
          blockLoadingAgentId={blockLoadingAgentId}
          statusLoadingAgentId={statusLoadingAgentId}
        />
      );
    },
  },
];
