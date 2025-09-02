import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Widget } from "@/types";
import { ColumnDef } from "@tanstack/react-table";
import { Globe, IdCard, MessageCircle, MoreHorizontal, Paintbrush, Text, Workflow } from "lucide-react";
import CelAction from "./cell-actions";

export const columns: ColumnDef<Widget>[] = [
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
    id: "name",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <IdCard className="size-5 stroke-1" />
          <span>Widget Name</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return <div>{row.original.name}</div>;
    },
    enableSorting: true,
    enableHiding: false,
  },
  {
    id: "domains",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Globe className="size-5 stroke-1" />
          <span>Domains</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return <div>{row.original.domains.join(", ")}</div>;
    },
    enableSorting: false,
    enableHiding: false,
  },
  // {
  //   id: "isEnabled",
  //   header: "Enabled",
  //   cell: ({ row }) => {
  //     return <div>{row.original.isEnabled ? "Yes" : "No"}</div>;
  //   },
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    id: "primaryColor",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Paintbrush className="size-5 stroke-1" />
          <span>Primary Color</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="size-3 rounded-full" style={{ backgroundColor: row.original.primaryColor }}></span>
          <Badge variant="outline" className="rounded-full">{row.original.primaryColor}</Badge>
        </div>
      </div>;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "welcomeMessage",
        header: () => {
          return (
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5 stroke-1" />
              <span>Welcome Message</span>
            </div>
          )
        },
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.original.welcomeMessage}</div>;
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "departments",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Workflow className="size-5 stroke-1" />
          <span>Departments</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return (
        <>
          {row.original.departmentIds.map((d, index) => (
            <div className="flex flex-wrap gap-2 items-center" key={index}>
              <Badge variant="outline" >
                {d.name}
              </Badge>
            </div>
          ))}
        </>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "headerText",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Text className="size-5 stroke-1" />
          <span>Header Text</span>
        </div>
      )
    },
    cell: ({ row }) => {
      return <div className="text-sm text-muted-foreground">{row.original.headerText}</div>;
    },
    enableSorting: false,
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
        <CelAction row={row} />
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
