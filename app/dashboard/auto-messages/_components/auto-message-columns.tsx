"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { AutoMessage, Widget } from "@/types";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Clock, Settings, Tag, MessageCircle, MoreHorizontal, GitBranchIcon, Heading1, Text } from "lucide-react";
import CellAction from "./cell-actions";

export const createColumns = (widgets: Widget[]): ColumnDef<AutoMessage>[] => [
  {
    accessorKey: "title",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Text className="size-5 stroke-1" />
          <span>Title</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const title = row.getValue("title") as string;
      return (
        <div className="font-medium max-w-[200px] truncate" title={title}>
          {title}
        </div>
      );
    },
  },
  {
    accessorKey: "message",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 stroke-1" />
          <span>Message</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const message = row.getValue("message") as string;
      return (
        <div className="max-w-[250px] truncate" title={message}>
          {message}
        </div>
      );
    },
  },
  {
    accessorKey: "domain",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Globe className="size-5 stroke-1" />
          <span>Domain</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const domain = row.getValue("domain") as string;
      return (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{domain}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "sitewide",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <MapPin className="size-5 stroke-1" />
          <span>Scope</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const sitewide = row.getValue("sitewide") as boolean;
      return (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500" />
          <Badge variant={sitewide ? "default" : "secondary"}>
            {sitewide ? "Sitewide" : "Page-specific"}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: "pagePaths",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <GitBranchIcon className="size-5 stroke-1" />
          <span>Page Paths</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const pagePaths = row.getValue("pagePaths") as string[];
      const sitewide = row.getValue("sitewide") as boolean;
      
      if (sitewide) {
        return (
          <div className="text-sm text-gray-500">
            All pages
          </div>
        );
      }

      if (pagePaths.length === 0) {
        return (
          <div className="text-sm text-gray-500">
            No paths specified
          </div>
        );
      }

      return (
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-500" />
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {pagePaths.slice(0, 2).map((path, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {path}
              </Badge>
            ))}
            {pagePaths.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{pagePaths.length - 2} more
              </Badge>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "showAfterSeconds",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Clock className="size-5 stroke-1" />
          <span>Show After</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const seconds = row.getValue("showAfterSeconds") as number;
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">{seconds}s</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isEnabled",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Settings className="size-5 stroke-1" />
          <span>Status</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const isEnabled = row.getValue("isEnabled") as boolean;
      return (
        <div className="flex items-center gap-2">

          <Badge variant={isEnabled ? "default" : "secondary"}>
            {isEnabled ? "Enabled" : "Disabled"}
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
    cell: ({ row }) => <CellAction data={row.original} widgets={widgets} />,
  },
];
