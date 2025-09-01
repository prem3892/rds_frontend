"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Department, AgentProfile } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface DepartmentColumnsProps {
  agents: AgentProfile[];
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export const createDepartmentColumns = (
  agents: AgentProfile[],
  onEdit: (department: Department) => void,
  onDelete: (department: Department) => void
): ColumnDef<Department>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>Department</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const department = row.original;
      return (
        <div className="flex items-center space-x-2">
          <span className="font-medium">{department.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "agents",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4" />
          <span>User Name</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const department = row.original;
      const departmentAgents = agents.filter(agent => 
        agent.departmentIds.includes(department._id)
      );
      
      return (
        <div className="flex items-center space-x-2">
          <div className="flex -space-x-2">
            {departmentAgents.slice(0, 5).map((agent) => (
              <TooltipProvider key={agent._id}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 border-2 border-white rounded-full bg-gray-100 hover:z-10 transition-transform hover:scale-110">
                      <AvatarFallback className="text-xs bg-blue-100 text-blue-600 font-medium">
                        {agent.user.firstName[0]}{agent.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{agent.user.firstName} {agent.user.lastName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          {departmentAgents.length > 5 && (
            <Badge variant="outline" className="text-xs font-medium">
              +{departmentAgents.length - 5} more
            </Badge>
          )}
          {departmentAgents.length === 0 && (
            <span className="text-sm text-gray-500 italic">No agents assigned</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const department = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="cursor-pointer"
              onClick={() => onEdit(department)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Department
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-600"
              onClick={() => onDelete(department)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Department
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
