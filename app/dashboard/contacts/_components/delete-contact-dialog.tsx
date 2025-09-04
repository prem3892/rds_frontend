"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteContact } from "@/lib/contact.api";
import { Contact } from "@/types/contact";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteContactDialogProps {
  contact: Contact;
  isOpen: boolean;
  onClose: () => void;
}

export default function DeleteContactDialog({
  contact,
  isOpen,
  onClose,
}: DeleteContactDialogProps) {
  const deleteContactMutation = useDeleteContact();

  const handleDelete = async () => {
    try {
      await deleteContactMutation.mutateAsync(contact._id);
      toast.success("Contact deleted successfully");
      onClose();
    } catch (error) {
      toast.error("Failed to delete contact");
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Contact</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the contact for{" "}
            <strong>{contact.firstName} {contact.lastName}</strong>? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteContactMutation.isPending}
          >
            {deleteContactMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
