"use client";

import { Badge } from "@/components/ui/badge";
import { BlockedCustomer } from "@/types/blocked-customer";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Calendar, 
  Globe, 
  Monitor, 
  MoreHorizontal, 
  ShieldX, 
  User, 
  Building,
  Clock,
  MapPin
} from "lucide-react";
import CellAction from "./cell-actions";
import Link from "next/link";

export const createColumns = (): ColumnDef<BlockedCustomer>[] => [
  {
    accessorKey: "fingerprint",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <User className="size-5 stroke-1" />
          <span>Customer Details</span>
        </div>
      )
    },
    cell: ({ row }) => {

      return (
        // name email and id in nice and clean UI 
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 font-normal ml-1">
               {row.original.name || "N/A"}

            </div>
            <div className="flex items-center gap-2">
                <Badge variant="outline">{row.original.email || "N/A"}</Badge>
            </div>
        </div>
      );
    },
  },
  {
    accessorKey: "widgetId",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Building className="size-5 stroke-1" />
          <span>Widget</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const widgetId = row.getValue("widgetId") as { _id: string; name: string };
      return (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">{widgetId.name}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "blockedBy",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <ShieldX className="size-5 stroke-1" />
          <span>Blocked By</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const blockedBy = row.getValue("blockedBy") as { firstName: string; lastName: string; email: string };
      return (
        <div className="flex items-center gap-2">
          <ShieldX className="h-4 w-4 text-red-500" />
          <div>
            <div className="text-sm font-medium">
              {blockedBy.firstName} {blockedBy.lastName}
            </div>
            <div className="text-xs text-gray-500">{blockedBy.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "blockedAt",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Calendar className="size-5 stroke-1" />
          <span>Blocked Date</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const blockedAt = row.getValue("blockedAt") as string;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {new Date(blockedAt).toLocaleDateString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "metadata",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Monitor className="size-5 stroke-1" />
          <span>Browser Info</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const metadata = row.getValue("metadata") as any;
      const browserInfo = metadata?.browserInfo;
      
      if (!browserInfo) {
        return (
          <div className="text-sm text-gray-500">No info</div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Monitor className="h-4 w-4 text-gray-500" />
          <div className="text-xs space-y-1">
            <div className="font-medium">{browserInfo.platform}</div>
            <div className="text-gray-500">{browserInfo.screenResolution}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "metadata.initialDomain",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Globe className="size-5 stroke-1" />
          <span>Domain</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const metadata = row.getValue("metadata") as any;
      const domain = metadata?.initialDomain;
      
      return (
        <Link href={`https://${domain}`} className="flex items-center gap-2">

          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium max-w-[120px] " title={domain}>
            {domain || "N/A"}
          </span>
        </Link>
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
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
