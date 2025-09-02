"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Department, AgentProfile } from "@/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Users } from "lucide-react";
import { AgentsCell } from "./agents-cell";
import { Checkbox } from "@/components/ui/checkbox";

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


  // {
  //   // show checkbox 
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected()}
  //       onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value: boolean | ((value: boolean) => boolean) | "indeterminate") => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //     />
  //   ),
  // },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex items-center space-x-2 ">
          <Users className="h-4 w-4" />
          <span>Department</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const department = row.original;
      return (
        <div className="flex items-center space-x-2 ">
          <span className="font-medium capitalize">{department.name}</span>
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
      return <AgentsCell department={department} agents={agents} />;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const department = row.original;

      return (
        <div className="flex items-center justify-start space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(department)}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onDelete(department)}
          className="h-8 w-8 text-red-500 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        </div>
      );
    },
  },
];
