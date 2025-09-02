"use client";

import { Widget } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Copy, Edit, Trash, Loader2 } from "lucide-react";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useRef } from "react";
import { useUpdateWidgetMutation, useDeleteWidgetMutation, WIDGETS_QUERY_KEY } from "@/lib/widget.api";
import { useGetAllDepartments } from "@/lib/department.api";
import { toast } from "sonner";
import { Globe, Palette, MessageSquareText, ShieldCheck } from "lucide-react";

// Zod schema for widget form validation (same as in page.tsx)
const widgetFormSchema = z.object({
  name: z.string().min(1, { message: "Widget name is required." }),
  domains: z.array(z.string()),
  departmentIds: z.array(z.string()),
  isEnabled: z.boolean(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color." }),
  welcomeMessage: z.string(),
  headerText: z.string(),
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

type Props = {
  row: Row<Widget>;
};

function CelAction({ row }: Props) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  const widget = row.original;

  // Handle click outside to close color picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    }

    if (showColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showColorPicker]);

  // Get departments for the form
  const { data: departments, isLoading: isLoadingDepartments } = useGetAllDepartments();

  // Form setup
  const form = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      name: "",
      domains: [],
      departmentIds: [],
      isEnabled: true,
      primaryColor: "#3B82F6",
      welcomeMessage: "Welcome! How can we help you today?",
      headerText: "Customer Support",
    },
  });

  // Mutations
  const updateWidgetMutation = useUpdateWidgetMutation({
    onSuccess: () => {
      toast("Widget Updated", {
        description: "The widget has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [WIDGETS_QUERY_KEY] });
      setIsEditDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const deleteWidgetMutation = useDeleteWidgetMutation({
    onSuccess: () => {
      toast("Widget Deleted", {
        description: "The widget has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: [WIDGETS_QUERY_KEY] });
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
    // Prefill form with widget data
    form.reset({
      name: widget.name || "",
      domains: widget.domains || [],
      departmentIds: widget.departmentIds.map((dep) => dep._id) || [],
      isEnabled: widget.isEnabled ?? true,
      primaryColor: widget.primaryColor || "#3B82F6",
      welcomeMessage: widget.welcomeMessage || "Welcome! How can we help you today?",
      headerText: widget.headerText || "Customer Support",
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = (values: WidgetFormValues) => {
    const processedValues = {
      ...values,
      // Filter out empty strings from domains if any
      domains: values.domains?.filter((domain) => domain.trim() !== "").map((d) => d.trim()) || [],
    };

    updateWidgetMutation.mutate({
      id: widget._id,
      data: processedValues,
    });
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    deleteWidgetMutation.mutate(widget._id);
  };

  // Handle copy script
  const handleCopyScript = () => {
    navigator.clipboard
      .writeText(`<script src="${widget.injectableScriptUrl}"></script>`)
      .then(() => toast("Script copied to clipboard."))
      .catch(() => toast.error("Copy Failed"));
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
          <Edit className="size-4  " />
          
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyScript}
          className="h-8 px-2 text-xs"
        >
          <Copy className="size-4 " />
        
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDeleteClick}
          className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <Trash className="size-4 " />
         
        </Button>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Widget</DialogTitle>
            <DialogDescription>
              Update the configuration for this chat widget.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 py-4">
              {/* Widget Name */}
              <FormField
                name="name"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Widget Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Main Support Chat" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Domains */}
              <FormField
                name="domains"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" /> Allowed Domains (optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example.com, anotherexample.net (comma-separated)"
                        value={field.value?.join(", ")}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value
                              ? e.target.value.split(",").map((d) => d.trim())
                              : []
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Leave empty to allow on any domain. Enter domains without http(s)://.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Departments */}
              <FormField
                name="departmentIds"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Associated Departments</FormLabel>
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
                        No departments available. Please create departments first.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Styling and Messages */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="primaryColor"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Palette className="mr-2 h-4 w-4" /> Primary Color
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2 relative" ref={colorPickerRef}>
                          <div
                            className="size-6 rounded-full border cursor-pointer"
                            style={{ backgroundColor: field.value }}
                            onClick={() => setShowColorPicker(!showColorPicker)}
                          />
                          <HexColorInput 
                            color={field.value} 
                            onChange={field.onChange}
                            className="flex-1 px-3 py-2 border rounded-md"
                            placeholder="#000000"
                          />
                          {showColorPicker && (
                            <div className="absolute top-full left-0 mt-2 z-50">
                              <HexColorPicker 
                                color={field.value} 
                                onChange={field.onChange}
                                onMouseDown={(e) => e.stopPropagation()}
                              />
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="isEnabled"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-auto">
                      <div className="space-y-0.5">
                        <FormLabel className="flex items-center">
                          <ShieldCheck className="mr-2 h-4 w-4" /> Enable Widget
                        </FormLabel>
                        <FormDescription>
                          Allow this widget to be active on websites.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="headerText"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header Text</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Live Support" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="welcomeMessage"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <MessageSquareText className="mr-2 h-4 w-4" /> Welcome Message
                    </FormLabel>
                    <FormControl>
                      <Textarea placeholder="e.g., Hello! How can we assist you today?" {...field} />
                    </FormControl>
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
                  disabled={updateWidgetMutation.isPending}
                >
                  {updateWidgetMutation.isPending ? (
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
              This action cannot be undone. This will permanently delete the widget "{widget.name}" and remove it from your account.
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
              disabled={deleteWidgetMutation.isPending}
            >
              {deleteWidgetMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Widget"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default CelAction;
