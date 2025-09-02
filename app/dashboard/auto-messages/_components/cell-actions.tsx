"use client";

import { useState } from "react";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUpdateAutoMessageMutation } from "@/lib/auto-message.api";
import { AutoMessage } from "@/types/auto-message";
import { Widget } from "@/types/widget";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AUTO_MESSAGES_QUERY_KEY } from "@/lib/auto-message.api";
import EditAutoMessageDialog from "./edit-auto-message-dialog";
import DeleteAutoMessageDialog from "./delete-auto-message-dialog";

interface CellActionProps {
  data: AutoMessage;
  widgets: Widget[];
}

export default function CellAction({ data, widgets }: CellActionProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const updateMutation = useUpdateAutoMessageMutation({
    onSuccess: () => {
      toast.success("Auto message updated successfully");
      queryClient.invalidateQueries({ queryKey: [AUTO_MESSAGES_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update auto message");
    },
  });

  const handleToggleStatus = () => {
    updateMutation.mutate({
      id: data._id,
      data: { isEnabled: !data.isEnabled },
    });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Edit Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditDialogOpen(true)}
          className="h-8 px-2"
        >
          <Edit className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>

        {/* Enable/Disable Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggleStatus}
          disabled={updateMutation.isPending}
          className="h-8 px-2"
        >
          {data.isEnabled ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="sr-only">Disable</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="sr-only">Enable</span>
            </>
          )}
        </Button>

        {/* Delete Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)}
          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>

      {/* Edit Dialog */}
      <EditAutoMessageDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        autoMessage={data}
        widgets={widgets}
      />

      {/* Delete Dialog */}
      <DeleteAutoMessageDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        autoMessage={data}
      />
    </>
  );
}
