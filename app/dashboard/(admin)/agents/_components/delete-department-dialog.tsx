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
import { DEPARTMENTS_QUERY_KEY, useDeleteDepartmentMutation } from "@/lib/department.api";
import { Department } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DeleteDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export default function DeleteDepartmentDialog({
  open,
  onOpenChange,
  department,
}: DeleteDepartmentDialogProps) {
  const queryClient = useQueryClient();

  const deleteDepartmentMutation = useDeleteDepartmentMutation({
    onSuccess: () => {
      toast("Department Deleted", {
        description: "Department has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Delete Failed", {
        description: error.message || "Failed to delete department.",
      });
    },
  });

  const handleDeleteConfirm = () => {
    if (department) {
      deleteDepartmentMutation.mutate(department._id);
    }
  };

  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the department &quot;{department.name}&quot; and remove it from your account.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteDepartmentMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeleteConfirm}
            disabled={deleteDepartmentMutation.isPending}
          >
            {deleteDepartmentMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Department"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
