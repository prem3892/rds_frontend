"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteAutoMessageMutation, AUTO_MESSAGES_QUERY_KEY } from "@/lib/auto-message.api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AutoMessage, Widget } from "@/types";

interface DeleteAutoMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoMessage: AutoMessage | null;
}

export default function DeleteAutoMessageDialog({
  open,
  onOpenChange,
  autoMessage,
}: DeleteAutoMessageDialogProps) {
  const queryClient = useQueryClient();

  const deleteAutoMessageMutation = useDeleteAutoMessageMutation({
    onSuccess: () => {
      toast("Auto Message Deleted", {
        description: "Auto message has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [AUTO_MESSAGES_QUERY_KEY] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Delete Failed", {
        description: error.message || "Failed to delete auto message.",
      });
    },
  });

  const handleDeleteConfirm = () => {
    if (autoMessage) {
      deleteAutoMessageMutation.mutate(autoMessage._id);
    }
  };

  if (!autoMessage) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the auto message "{autoMessage.title}" and remove it from your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteAutoMessageMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteAutoMessageMutation.isPending}
          >
            {deleteAutoMessageMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Auto Message"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
