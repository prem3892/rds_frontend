"use client";

import { CannedMessage } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Loader2 } from "lucide-react";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateCannedMessageMutation, useDeleteCannedMessageMutation, CANNED_MESSAGES_QUERY_KEY } from "@/lib/canned.api";
import { useGetAllDepartments } from "@/lib/department.api";
import { toast } from "sonner";
import { MessageSquare, Globe, Users, Tag } from "lucide-react";

// Zod schema for canned message form validation
const cannedMessageFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title must be 100 characters or less." }),
  content: z.string().min(1, { message: "Content is required." }).max(2000, { message: "Content must be 2000 characters or less." }),
  isGlobal: z.boolean(),
  departmentIds: z.array(z.string()),
  tags: z.array(z.string()),
});

type CannedMessageFormValues = z.infer<typeof cannedMessageFormSchema>;

type Props = {
  row: Row<CannedMessage>;
};

function CellAction({ row }: Props) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const queryClient = useQueryClient();
  const message = row.original;

  // Get departments for the form
  const { data: departments, isLoading: isLoadingDepartments } = useGetAllDepartments();

  // Form setup
  const form = useForm<CannedMessageFormValues>({
    resolver: zodResolver(cannedMessageFormSchema),
    defaultValues: {
      title: "",
      content: "",
      isGlobal: false,
      departmentIds: [],
      tags: [],
    },
  });

  // Mutations
  const updateMessageMutation = useUpdateCannedMessageMutation({
    onSuccess: () => {
      toast("Message Updated", {
        description: "The canned message has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [CANNED_MESSAGES_QUERY_KEY] });
      setIsEditDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const deleteMessageMutation = useDeleteCannedMessageMutation({
    onSuccess: () => {
      toast("Message Deleted", {
        description: "The canned message has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [CANNED_MESSAGES_QUERY_KEY] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Deletion Failed", {
        description: error.message,
      });
    },
  });

  // Handle edit button click
  const handleEditClick = () => {
    // Prefill form with message data
    form.reset({
      title: message.title || "",
      content: message.content || "",
      isGlobal: message.isGlobal ?? false,
      departmentIds: message.departmentIds.map((dep) => dep._id) || [],
      tags: message.tags || [],
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = (values: CannedMessageFormValues) => {
    const processedValues = {
      ...values,
      // Filter out empty strings from tags if any
      tags: values.tags?.filter((tag) => tag.trim() !== "").map((t) => t.toLowerCase().trim()) || [],
    };

    updateMessageMutation.mutate({
      id: message._id,
      data: processedValues,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    deleteMessageMutation.mutate(message._id);
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={handleEditClick}
          className="h-8 px-2 text-xs"
        >
          <Edit className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteClick}
          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash className="size-4" />
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Canned Message</DialogTitle>
            <DialogDescription>
              Update the canned message details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
              {/* Title */}
              <FormField
                name="title"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" /> Title
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Welcome Message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Content */}
              <FormField
                name="content"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your message content..." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Global Visibility */}
              <FormField
                name="isGlobal"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel className="flex items-center">
                        <Globe className="mr-2 h-4 w-4" /> Global Message
                      </FormLabel>
                      <FormDescription>
                        Make this message visible to all agents under the same admin.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Departments */}
              <FormField
                name="departmentIds"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Users className="mr-2 h-4 w-4" /> Associated Departments
                    </FormLabel>
                    {isLoadingDepartments && (
                      <p className="text-sm text-muted-foreground">Loading departments...</p>
                    )}
                    {!isLoadingDepartments && departments && departments.length > 0 ? (
                      <div className="space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md">
                        {departments.map((dept) => (
                          <FormItem
                            key={dept._id}
                            className="flex flex-row items-center space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(dept._id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), dept._id])
                                    : field.onChange(
                                        (field.value || []).filter((value) => value !== dept._id)
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{dept.name}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No departments available.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <FormField
                name="tags"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Tag className="mr-2 h-4 w-4" /> Tags
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="greeting, welcome, support (comma-separated)"
                        value={field.value?.join(", ")}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? e.target.value.split(",").map((t) => t.trim())
                              : []
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Add tags to categorize and filter messages. Tags will be converted to lowercase.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMessageMutation.isPending}
                >
                  {updateMessageMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you absolutely sure?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the canned message "{message.title}" and remove it from your account.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteMessageMutation.isPending}
            >
              {deleteMessageMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Message"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CellAction;
