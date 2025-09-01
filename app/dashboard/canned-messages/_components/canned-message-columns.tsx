import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { CannedMessage } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Globe, Keyboard, MoreHorizontal, Tag, User, Users } from "lucide-react";
import CellAction from "./cell-actions";
import { cn } from "@/lib/utils";


export const columns: ColumnDef<CannedMessage>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "title",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Keyboard className="size-5 stroke-1" />
          <span>Shortcut</span>
        </div>
      )
    },
    cell: ({ row }) => {
        return <div className="font-medium">{row.original.title}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "content",
    header: "Message",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground max-w-xs truncate">
          {row.original.content}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "isGlobal",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Globe className="size-5 stroke-1" />
          <span>Visibility</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return (
        <Badge variant={row.original.isGlobal ? "default" : "outline"}
        className={cn(
          row.original.isGlobal ? "bg-blue-500 text-white border-0" : "bg-transparent text-blue-500 border border-blue-500"
        )}
        >

          {row.original.isGlobal ? "Global" : "Personal"}
        </Badge>
      );
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "agentId",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <User className="size-5 stroke-1" />
          <span>Created by</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return <div className="text-sm">{row.original.agentId.firstName} {row.original.agentId.lastName}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "departmentIds",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Users className="size-5 stroke-1" />
          <span>Departments</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-1">
          {row.original.departmentIds.length > 0 ? (
            row.original.departmentIds.map((dept, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {dept.name}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">All departments</span>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "tags",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Tag className="size-5 stroke-1" />
          <span>Tags</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return (
        <div className="flex flex-wrap gap-1">
          {row.original.tags.length > 0 ? (
            row.original.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))
          ) : (
            <span className="text-sm text-muted-foreground">No tags</span>
          )}
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return (
        <div className="text-sm text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </div>
      );
    },
    enableSorting: true,
    enableHiding: false,
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
        <CellAction row={row} />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
