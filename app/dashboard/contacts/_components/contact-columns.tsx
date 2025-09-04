"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Contact } from "@/types/contact";
import { ColumnDef } from "@tanstack/react-table";
import { 
  Calendar, 
  Mail, 
  Phone, 
  User, 
  Building,
  Clock,
  Edit,
  Trash
} from "lucide-react";
import { useState } from "react";
import EditContactDialog from "./edit-contact-dialog";
import DeleteContactDialog from "./delete-contact-dialog";

// Table Actions Component
const TableActions = ({ contact }: { contact: Contact }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>

      <EditContactDialog
        contact={contact}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />

      <DeleteContactDialog
        contact={contact}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};

export const createColumns = (): ColumnDef<Contact>[] => [
  {
    accessorKey: "firstName",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <User className="size-5 stroke-1" />
          <span>Contact Details</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const contact = row.original;
      return (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 font-normal ml-1">
            {contact.firstName} {contact.lastName}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{contact.email}</Badge>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "phone",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Phone className="size-5 stroke-1" />
          <span>Phone</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium">{phone || "N/A"}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "customer",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Building className="size-5 stroke-1" />
          <span>Customer</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const customer = row.getValue("customer") as { _id: string; name: string; email: string; fingerprint: string };
      return (
        <div className="flex items-center gap-2">
          <Building className="h-4 w-4 text-gray-500" />
          <div>
            <div className="text-sm font-medium">{customer.name}</div>
            <div className="text-xs text-gray-500">{customer.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Calendar className="size-5 stroke-1" />
          <span>Created Date</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as string;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {new Date(createdAt).toLocaleDateString()}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <Clock className="size-5 stroke-1" />
          <span>Last Updated</span>
        </div>
      )
    },
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as string;
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm">
            {new Date(updatedAt).toLocaleDateString()}
          </span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: () => {
      return (
        <div className="flex items-center gap-2">
          <span>Actions</span>
        </div>
      )
    },
    cell: ({ row }) => <TableActions contact={row.original} />,
  },
];
