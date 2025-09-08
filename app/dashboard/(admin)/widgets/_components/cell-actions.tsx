"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useGetAllDepartments } from "@/lib/department.api";
import { useDeleteWidgetMutation, useUpdateWidgetMutation, WIDGETS_QUERY_KEY } from "@/lib/widget.api";
import { Widget } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Row } from "@tanstack/react-table";
import { Copy, Edit, Globe, Loader2, MessageSquareText, Palette, ShieldCheck, Trash } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useCurrentUser } from "@/stores/auth";

// Theme presets and schema (mirrors new page)
const THEME_PRESETS = {
  "Light blue": {
    primaryColor: "#3B82F6",
    secondaryColor: "#64748B",
  },
  "Sharp blue": {
    primaryColor: "#2563EB",
    secondaryColor: "#0EA5E9",
  },
  Custom: {
    primaryColor: "#3B82F6",
    secondaryColor: "#64748B",
  },
} as const;

const widgetFormSchema = z.object({
  name: z.string().min(1, { message: "Widget name is required." }),
  domains: z.array(z.string()),
  departmentIds: z.array(z.string()),
  isEnabled: z.boolean(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color." }),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color." }),
  themeName: z.enum(["Light blue", "Sharp blue", "Custom"]),
  welcomeMessage: z.string(),
  headerText: z.string(),
  offline_text: z.string(),
  notification_emails: z.array(z.string().email()),
  button_location: z.enum([
    "top_left",
    "top_right",
    "bottom_left",
    "bottom_right",
    "center_left",
    "center_right",
  ]),
  button_label: z.string(),
  widget_text_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color." }),
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

type Props = {
  row: Row<Widget>;
};

function CelAction({ row }: Props) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showPrimaryColorPicker, setShowPrimaryColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const currentUser = useCurrentUser();

  const queryClient = useQueryClient();
  const widget = row.original;

  // Handle click outside to close color picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowPrimaryColorPicker(false);
        setShowSecondaryColorPicker(false);
        setShowTextColorPicker(false);
      }
    }

    if (showPrimaryColorPicker || showSecondaryColorPicker || showTextColorPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPrimaryColorPicker, showSecondaryColorPicker, showTextColorPicker]);

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
      primaryColor: THEME_PRESETS["Light blue"].primaryColor,
      secondaryColor: THEME_PRESETS["Light blue"].secondaryColor,
      themeName: "Light blue",
      welcomeMessage: "Welcome! How can we help you today?",
      headerText: "Customer Support",
      offline_text: "We are offline right now",
      notification_emails: [],
      button_location: "bottom_right",
      button_label: "Chat with us",
      widget_text_color: "#FFFFFF",
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
    const initialPrimary = widget.primaryColor || THEME_PRESETS["Light blue"].primaryColor;
    const initialSecondary = widget.secondaryColor || THEME_PRESETS["Light blue"].secondaryColor;
    const matchedPreset = Object.entries(THEME_PRESETS).find(
      ([name, preset]) =>
        preset.primaryColor.toLowerCase() === initialPrimary.toLowerCase() &&
        preset.secondaryColor.toLowerCase() === initialSecondary.toLowerCase()
    );
    const themeName = (widget.theme?.name as any) || (matchedPreset ? (matchedPreset[0] as any) : "Custom");

    form.reset({
      name: widget.name || "",
      domains: widget.domains || [],
      departmentIds: widget.departmentIds.map((dep) => dep._id) || [],
      isEnabled: widget.isEnabled ?? true,
      primaryColor: initialPrimary,
      secondaryColor: initialSecondary,
      themeName,
      welcomeMessage: widget.welcomeMessage || "Welcome! How can we help you today?",
      headerText: widget.headerText || "Customer Support",
      offline_text: widget.offline_text || "We are offline right now",
      notification_emails: widget.notification_emails || (currentUser?.email ? [currentUser.email] : []),
      button_location: (widget.button_location as any) || "bottom_right",
      button_label: widget.button_label || "Chat with us",
      widget_text_color: widget.widget_text_color || "#FFFFFF",
    });
    setIsEditDialogOpen(true);
  };

  // Handle delete button click
  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = (values: WidgetFormValues) => {
    const { themeName, ...rest } = values;
    const theme = {
      name: themeName,
      primaryColor: values.primaryColor,
      secondaryColor: values.secondaryColor,
    } as const;

    const processedValues = {
      ...rest,
      theme,
      // Filter out empty strings from domains if any
      domains: values.domains?.filter((domain) => domain.trim() !== "").map((d) => d.trim()) || [],
      notification_emails: values.notification_emails?.map((e) => e.trim()).filter((e) => e.length > 0) || [],
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

              {/* Theme & Styling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Theme Name */}
                <FormField
                  name="themeName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Theme</FormLabel>
                      <FormControl>
                        <Select
                          value={field.value}
                          onValueChange={(val) => {
                            field.onChange(val);
                            if (val !== "Custom") {
                              const preset = THEME_PRESETS[val as keyof typeof THEME_PRESETS];
                              form.setValue("primaryColor", preset.primaryColor, { shouldDirty: true });
                              form.setValue("secondaryColor", preset.secondaryColor, { shouldDirty: true });
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select theme" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Light blue">Light blue</SelectItem>
                            <SelectItem value="Sharp blue">Sharp blue</SelectItem>
                            <SelectItem value="Custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                            onClick={() => setShowPrimaryColorPicker(!showPrimaryColorPicker)}
                          />
                          <HexColorInput 
                            color={field.value} 
                            onChange={field.onChange}
                            className="flex-1 px-3 py-2 border rounded-md"
                            placeholder="#000000"
                          />
                          {showPrimaryColorPicker && (
                            <div className="absolute top-full left-0 mt-2 z-50">
                              <HexColorPicker 
                                color={field.value} 
                                onChange={(color) => {
                                  field.onChange(color);
                                  const matchesPreset = Object.entries(THEME_PRESETS).find(
                                    ([name, preset]) =>
                                      preset.primaryColor.toLowerCase() === color.toLowerCase() &&
                                      preset.secondaryColor.toLowerCase() === form.getValues("secondaryColor").toLowerCase()
                                  );
                                  form.setValue("themeName", matchesPreset ? (matchesPreset[0] as any) : "Custom", { shouldDirty: true });
                                }}
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
                  name="secondaryColor"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Palette className="mr-2 h-4 w-4" /> Secondary Color
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2 relative" ref={colorPickerRef}>
                          <div
                            className="size-6 rounded-full border cursor-pointer"
                            style={{ backgroundColor: field.value }}
                            onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
                          />
                          <HexColorInput 
                            color={field.value} 
                            onChange={field.onChange}
                            className="flex-1 px-3 py-2 border rounded-md"
                            placeholder="#000000"
                          />
                          {showSecondaryColorPicker && (
                            <div className="absolute top-full left-0 mt-2 z-50">
                              <HexColorPicker 
                                color={field.value} 
                                onChange={(color) => {
                                  field.onChange(color);
                                  const matchesPreset = Object.entries(THEME_PRESETS).find(
                                    ([name, preset]) =>
                                      preset.secondaryColor.toLowerCase() === color.toLowerCase() &&
                                      preset.primaryColor.toLowerCase() === form.getValues("primaryColor").toLowerCase()
                                  );
                                  form.setValue("themeName", matchesPreset ? (matchesPreset[0] as any) : "Custom", { shouldDirty: true });
                                }}
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

              {/* Button appearance and behavior */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="button_location"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Location</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="top_left">Top left</SelectItem>
                            <SelectItem value="top_right">Top right</SelectItem>
                            <SelectItem value="bottom_left">Bottom left</SelectItem>
                            <SelectItem value="bottom_right">Bottom right</SelectItem>
                            <SelectItem value="center_left">Center left</SelectItem>
                            <SelectItem value="center_right">Center right</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="button_label"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Button Label</FormLabel>
                      <FormControl>
                        <Input placeholder="Chat with us" {...field} />
                      </FormControl>
                      <FormMessage />
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

              <FormField
                name="offline_text"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Offline Message</FormLabel>
                    <FormControl>
                      <Textarea placeholder="We are offline right now. Please leave a message and we will get back to you in a few business hours." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="notification_emails"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notification Emails (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="admin@example.com, support@example.com"
                          value={field.value?.join(", ")}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? e.target.value.split(",").map((d) => d.trim()) : []
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="widget_text_color"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Palette className="mr-2 h-4 w-4" /> Widget Text Color
                      </FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2 relative" ref={colorPickerRef}>
                          <div
                            className="size-6 rounded-full border cursor-pointer"
                            style={{ backgroundColor: field.value || "#FFFFFF" }}
                            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
                          />
                          <HexColorInput 
                            color={field.value || "#FFFFFF"} 
                            onChange={field.onChange}
                            className="flex-1 px-3 py-2 border rounded-md"
                            placeholder="#ffffff"
                          />
                          {showTextColorPicker && (
                            <div className="absolute top-full left-0 mt-2 z-50">
                              <HexColorPicker 
                                color={field.value || "#FFFFFF"} 
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
              </div>

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
              This action cannot be undone. This will permanently delete the widget &quot;{widget.name}&quot; and remove it from your account.
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
