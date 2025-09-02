"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AgentProfile } from "@/lib/agent.api";
import { Department } from "@/types";
import { 
  Edit, 
  ToggleLeft, 
  MessageSquare, 
  Building, 
  Globe, 
  User,
  Mail,
  ShieldCheck,
  MoreHorizontal,
  Settings
} from "lucide-react";
import CellActions from "./cell-actions";

interface AgentColumnsProps {
  departments: Department[];
  onEdit: (agent: AgentProfile) => void;
  onToggleStatus: (agent: AgentProfile) => void;
}

export const createAgentColumns = ({ 
  departments, 
  onEdit, 
  onToggleStatus 
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
        <div className="flex items-center space-x-2">
          <User className="h-4 w-4 text-blue-500" />
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
  {
    accessorKey: "status",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Settings className="size-5 stroke-1" />
          <span>Status</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <div className="flex items-center justify-start">
          <Badge
            variant={agent.isOnline ? "default" : "secondary"}
            className="font-normal"
          >
            {agent.isOnline ? "Online" : "Offline"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "maxConcurrentChats",
      header: () => {
      return (
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 stroke-1" />
          <span>Max Chats</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const agent = row.original;
      return (
        <div className="flex items-center justify-start space-x-2">
          <Badge variant="outline">
            {agent.maxConcurrentChats}
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
      const agent = row.original;
      return (
        <div className="flex items-center justify-start  space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onEdit(agent)}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant={agent.isOnline ? "destructive" : "default"}
            size="icon"
            onClick={() => onToggleStatus(agent)}
            className="h-8 w-8"
          >
            <ToggleLeft className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
