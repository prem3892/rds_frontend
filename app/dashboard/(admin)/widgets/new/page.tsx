"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  useCreateWidgetMutation,
  WIDGETS_QUERY_KEY,
} from "@/lib/widget.api";
import { useGetAllDepartments } from "@/lib/department.api";
import { CreateWidgetDto, Department } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Palette,
  Globe,
  MessageSquareText,
  ShieldCheck,
  Settings2,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { useCurrentUser } from "@/stores/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

// Zod schema for widget form validation
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

export default function NewWidgetPage() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showColorPicker, setShowColorPicker] = useState(false);

  // Get departments for the form
  const { data: departments, isLoading: isLoadingDepartments } =
    useGetAllDepartments({
      enabled: currentUser?.role === "ADMIN",
    });

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

  const createWidgetMutation = useCreateWidgetMutation({
    onSuccess: () => {
      toast("Widget Created", {
        description: "The new widget has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: [WIDGETS_QUERY_KEY] });
      router.push("/dashboard/widgets");
    },
    onError: (error) => {
      toast.error("Failed to create widget.", {
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

    createWidgetMutation.mutate(processedValues as CreateWidgetDto);
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-4 md:p-6 lg:p-8 space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-6" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">

            Create New Widget
          </h1>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Widget Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6"
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
                        <MessageSquareText className="mr-2 h-4 w-4" /> Welcome
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Hello! How can we assist you today?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/widgets")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createWidgetMutation.isPending}
                  >
                    {createWidgetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Widget"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right Column - Preview */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Widget Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center text-gray-500">
                <Settings2 className="mx-auto h-12 w-12 mb-4" />
                <p className="text-lg font-medium">Preview Coming Soon</p>
                <p className="text-sm">Widget preview will be displayed here</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
