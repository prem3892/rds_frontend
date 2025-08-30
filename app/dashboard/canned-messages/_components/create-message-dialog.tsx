"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { useCreateCannedMessageMutation, CANNED_MESSAGES_QUERY_KEY } from "@/lib/canned.api";
import { toast } from "sonner";
import { Loader2, MessageSquare, Globe, Users, Tag } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

// Zod schema for canned message form validation
const cannedMessageFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }).max(100, { message: "Title must be 100 characters or less." }),
  content: z.string().min(1, { message: "Content is required." }).max(2000, { message: "Content must be 2000 characters or less." }),
  isGlobal: z.boolean(),
  departmentIds: z.array(z.string()),
  tags: z.array(z.string()),
});

type CannedMessageFormValues = z.infer<typeof cannedMessageFormSchema>;

interface CreateMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Array<{ _id: string; name: string }>;
}

export default function CreateMessageDialog({
  open,
  onOpenChange,
  departments,
}: CreateMessageDialogProps) {
  const queryClient = useQueryClient();

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

  // Create mutation
  const createMessageMutation = useCreateCannedMessageMutation({
    onSuccess: () => {
      toast("Message Created", {
        description: "The canned message has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: [CANNED_MESSAGES_QUERY_KEY] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Creation Failed", {
        description: error.message,
      });
    },
  });

  // Handle form submission
  const handleFormSubmit = (values: CannedMessageFormValues) => {
    const processedValues = {
      ...values,
      // Filter out empty strings from tags if any
      tags: values.tags?.filter((tag) => tag.trim() !== "").map((t) => t.toLowerCase().trim()) || [],
    };

    createMessageMutation.mutate(processedValues);
  };

  // Handle dialog close
  const handleClose = () => {
    if (!createMessageMutation.isPending) {
      onOpenChange(false);
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Create New Canned Message
          </DialogTitle>
          <DialogDescription>
            Create a reusable message template for quick responses during chat conversations.
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
                  <FormDescription>
                    A short, descriptive title for this message (max 100 characters).
                  </FormDescription>
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
                  <FormDescription>
                    The actual message content that will be sent (max 2000 characters).
                  </FormDescription>
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
                  {departments && departments.length > 0 ? (
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
                      No departments available. The message will be available to all departments.
                    </p>
                  )}
                  <FormDescription>
                    Select departments to restrict this message to specific teams. Leave empty to make it available to all departments.
                  </FormDescription>
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

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={createMessageMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMessageMutation.isPending}
                className="flex-1 bg-[#1B76FF] hover:bg-blue-600"
              >
                {createMessageMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Message"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
