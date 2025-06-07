// src/app/(dashboard)/admin/widgets/page.tsx
"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { HexColorPicker } from "react-colorful"; // For color picker

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox"; // For department selection
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"; // For color picker

import {
  useGetAllWidgets,
  useCreateWidgetMutation,
  useUpdateWidgetMutation,
  useDeleteWidgetMutation,
  WIDGETS_QUERY_KEY, // For query invalidation
} from "@/lib/api"; // Ensure api-widget is exported from here
import { useGetAllDepartments } from "@/lib/department.api"; // Assuming this hook exists or will be created
import { Widget, CreateWidgetDto, UpdateWidgetDto, Department } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  ClipboardCopy,
  Edit,
  Trash2,
  PlusCircle,
  Palette,
  Globe,
  MessageSquareText,
  Settings2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { useCurrentUser } from "@/stores/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Zod schema for widget form validation
const widgetFormSchema = z.object({
  name: z.string().min(1, { message: "Widget name is required." }).default(""),
  domains: z.array(z.string()).default([]),
  departmentIds: z.array(z.string()).default([]),
  isEnabled: z.boolean().default(true),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color." })
    .default("#3B82F6"),
  welcomeMessage: z.string().default("Welcome! How can we help you today?"),
  headerText: z.string().default("Customer Support"),
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

export default function WidgetsPage() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState<Widget | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const {
    data: widgets,
    isLoading: isLoadingWidgets,
    error: widgetsError,
  } = useGetAllWidgets({
    enabled: currentUser?.role === "ADMIN",
  });
  // Assume you have a hook to get all departments for selection
  const { data: departments, isLoading: isLoadingDepartments } =
    useGetAllDepartments({
      enabled: currentUser?.role === "ADMIN", // Only load if admin is managing widgets
    });

  const form = useForm({
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

  const domainsString = form.watch("domains")?.join(", ") || "";

  const createWidgetMutation = useCreateWidgetMutation({
    onSuccess: () => {
      toast("Widget Created", {
        description: "The new widget has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: [WIDGETS_QUERY_KEY] });
      setIsDialogOpen(false);
      form.reset({
        name: "",
        domains: [],
        departmentIds: [],
        isEnabled: true,
        primaryColor: "#3B82F6",
        welcomeMessage: "Welcome! How can we help you today?",
        headerText: "Customer Support",
      });
    },
    onError: (error) => {
      toast.error("Failed to create widget.");
    },
  });

  const updateWidgetMutation = useUpdateWidgetMutation({
    onSuccess: () => {
      toast("Widget Updated", {
        description: "The widget has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [WIDGETS_QUERY_KEY] });
      setIsDialogOpen(false);
      setEditingWidget(null);
      form.reset({
        name: "",
        domains: [],
        departmentIds: [],
        isEnabled: true,
        primaryColor: "#3B82F6",
        welcomeMessage: "Welcome! How can we help you today?",
        headerText: "Customer Support",
      });
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const deleteWidgetMutation = useDeleteWidgetMutation({
    onSuccess: (deletedWidget) => {
      toast("Widget Deleted");
      queryClient.invalidateQueries({ queryKey: [WIDGETS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error("Deletion Failed", {
        description: error.message,
      });
    },
  });

  const handleFormSubmit = (values: WidgetFormValues) => {
    const processedValues = {
      ...values,
      // Filter out empty strings from domains if any
      domains:
        values.domains
          ?.filter((domain) => domain.trim() !== "")
          .map((d) => d.trim()) || [],
    };

    if (editingWidget) {
      updateWidgetMutation.mutate({
        id: editingWidget._id,
        data: processedValues as UpdateWidgetDto,
      });
    } else {
      createWidgetMutation.mutate(processedValues as CreateWidgetDto);
    }
  };

  const handleEdit = (widget: Widget) => {
    setEditingWidget(widget);
    form.reset({
      name: widget.name || "",
      domains: widget.domains || [],
      departmentIds: widget.departmentIds.map((dep) => dep._id) || [],
      isEnabled: widget.isEnabled ?? true,
      primaryColor: widget.primaryColor || "#3B82F6",
      welcomeMessage:
        widget.welcomeMessage || "Welcome! How can we help you today?",
      headerText: widget.headerText || "Customer Support",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (widgetId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this widget? This action cannot be undone."
      )
    ) {
      deleteWidgetMutation.mutate(widgetId);
    }
  };

  const handleCopyScript = (scriptUrl: string) => {
    navigator.clipboard
      .writeText(`<script src="${scriptUrl}"></script>`)
      .then(() => toast("Script copied to clipboard."))
      .catch(() => toast.error("Copy Failed"));
  };

  if (currentUser?.role !== "ADMIN") {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to manage widgets.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <Settings2 className="mr-3 h-7 w-7 text-primary" /> Manage Chat
          Widgets
        </h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingWidget(null);
              form.reset({
                name: "",
                domains: [],
                departmentIds: [],
                isEnabled: true,
                primaryColor: "#3B82F6",
                welcomeMessage: "Welcome! How can we help you today?",
                headerText: "Customer Support",
              });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingWidget(null);
                form.reset({
                  name: "",
                  domains: [],
                  departmentIds: [],
                  isEnabled: true,
                  primaryColor: "#3B82F6",
                  welcomeMessage: "Welcome! How can we help you today?",
                  headerText: "Customer Support",
                });
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Widget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWidget ? "Edit Widget" : "Create New Widget"}
              </DialogTitle>
              <DialogDescription>
                {editingWidget
                  ? "Update the configuration for this chat widget."
                  : "Configure a new chat widget for your website."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6 py-4"
              >
                {/* Widget Name */}
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Widget Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Main Support Chat"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.name?.message}
                      </FormMessage>
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
                        <Globe className="mr-2 h-4 w-4" /> Allowed Domains
                        (optional)
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
                        Leave empty to allow on any domain. Enter domains
                        without http(s)://.
                      </FormDescription>
                      <FormMessage>
                        {form.formState.errors.domains?.message ||
                          form.formState.errors.domains?.root?.message}
                      </FormMessage>
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
                        <p className="text-sm text-muted-foreground">
                          Loading departments...
                        </p>
                      )}
                      {!isLoadingDepartments &&
                      departments &&
                      departments.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto border p-3 rounded-md">
                          {departments.map((dept: Department) => (
                            <FormItem
                              key={dept._id}
                              className="flex flex-row items-center space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(dept._id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          dept._id,
                                        ])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== dept._id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {dept.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No departments available. Please create departments
                          first.
                        </p>
                      )}
                      <FormMessage>
                        {form.formState.errors.departmentIds?.message}
                      </FormMessage>
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
                          <Popover
                            open={showColorPicker}
                            onOpenChange={setShowColorPicker}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start font-normal"
                              >
                                <div
                                  className="w-5 h-5 rounded-sm mr-2 border"
                                  style={{ backgroundColor: field.value }}
                                />
                                {field.value}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 border-0"
                              align="start"
                            >
                              <HexColorPicker
                                color={field.value}
                                onChange={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage>
                          {form.formState.errors.primaryColor?.message}
                        </FormMessage>
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
                            <ShieldCheck className="mr-2 h-4 w-4" /> Enable
                            Widget
                          </FormLabel>
                          <FormDescription>
                            Allow this widget to be active on websites.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
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
                      <FormMessage>
                        {form.formState.errors.headerText?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <FormField
                  name="welcomeMessage"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MessageSquareText className="mr-2 h-4 w-4" /> Welcome
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Hello! How can we assist you today?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage>
                        {form.formState.errors.welcomeMessage?.message}
                      </FormMessage>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={
                      createWidgetMutation.isPending ||
                      updateWidgetMutation.isPending
                    }
                  >
                    {createWidgetMutation.isPending ||
                    updateWidgetMutation.isPending
                      ? "Saving..."
                      : editingWidget
                      ? "Save Changes"
                      : "Create Widget"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoadingWidgets && (
        <p className="text-center text-muted-foreground">Loading widgets...</p>
      )}
      {widgetsError && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{widgetsError.message}</AlertDescription>
        </Alert>
      )}

      {!isLoadingWidgets && widgets && widgets.length === 0 && (
        <Card className="text-center p-6">
          <CardHeader>
            <CardTitle>No Widgets Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You haven't created any chat widgets yet.
            </p>
            <Button
              onClick={() => {
                setEditingWidget(null);
                form.reset();
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Widget
            </Button>
          </CardContent>
        </Card>
      )}

      {widgets && widgets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {widgets.map((widget) => (
            <Card key={widget._id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{widget.name}</CardTitle>
                  <Badge variant={widget.isEnabled ? "default" : "secondary"}>
                    {widget.isEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center pt-1">
                  <div
                    className="w-4 h-4 rounded-sm mr-1.5 border"
                    style={{ backgroundColor: widget.primaryColor }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {widget.primaryColor}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm flex-grow">
                <p>
                  <strong>Departments:</strong>{" "}
                  {widget.departmentIds.map((d) => d.name).join(", ") || "None"}
                </p>
                <p>
                  <strong>Domains:</strong>{" "}
                  {widget.domains.join(", ") || "Any domain"}
                </p>
                <div className="mt-2">
                  <Label
                    htmlFor={`script-${widget._id}`}
                    className="text-xs font-semibold"
                  >
                    Embed Script:
                  </Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      id={`script-${widget._id}`}
                      type="text"
                      readOnly
                      value={`<script src="${widget.injectableScriptUrl}"></script>`}
                      className="text-xs h-8 flex-grow bg-muted"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        handleCopyScript(widget.injectableScriptUrl)
                      }
                    >
                      <ClipboardCopy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(widget)}
                >
                  <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(widget._id)}
                  disabled={
                    deleteWidgetMutation.isPending &&
                    deleteWidgetMutation.variables === widget._id
                  }
                >
                  {deleteWidgetMutation.isPending &&
                  deleteWidgetMutation.variables === widget._id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
