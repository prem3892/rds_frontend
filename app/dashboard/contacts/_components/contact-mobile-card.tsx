"use client";

import { Contact } from "@/types/contact";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Clock, 
  Edit, 
  Trash,
  MoreHorizontal
} from "lucide-react";
import { useState } from "react";
import EditContactDialog from "./edit-contact-dialog";
import DeleteContactDialog from "./delete-contact-dialog";

interface ContactMobileCardProps {
  contact: Contact;
}

export default function ContactMobileCard({ contact }: ContactMobileCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Contact Name Header */}
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-sm text-gray-900">
                {contact.firstName} {contact.lastName}
              </span>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="h-8 w-8 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button> */}
          </div>

          {/* Email */}
          <div className="flex items-start gap-2">
            <Mail className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Email</span>
              <div className="mt-1">
                <div className="text-sm text-gray-700">{contact.email}</div>
              </div>
            </div>
          </div>

          {/* Phone */}
          {contact.phone && (
            <div className="flex items-start gap-2">
              <Phone className="h-4 w-4 text-gray-500 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Phone</span>
                <div className="mt-1">
                  <div className="text-sm text-gray-700">{contact.phone}</div>
                </div>
              </div>
            </div>
          )}

          {/* Customer */}
          <div className="flex items-start gap-2">
            <Building className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Customer</span>
              <div className="mt-1">
                <div className="text-sm text-gray-700">{contact.customer?.name}</div>
                <div className="text-xs text-gray-500">{contact.customer?.email}</div>
              </div>
            </div>
          </div>

          {/* Created Date */}
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Created</span>
              <div className="mt-1">
                <div className="text-sm text-gray-700">
                  {new Date(contact.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Last Updated */}
          <div className="flex items-start gap-2">
            <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Last Updated</span>
              <div className="mt-1">
                <div className="text-sm text-gray-700">
                  {new Date(contact.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
              className="flex-1 h-8 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </CardContent>

      {/* Edit Dialog */}
      <EditContactDialog
        contact={contact}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
      />

      {/* Delete Dialog */}
      <DeleteContactDialog
        contact={contact}
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      />
    </Card>
  );
}
