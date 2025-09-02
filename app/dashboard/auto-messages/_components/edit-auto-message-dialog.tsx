"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useUpdateAutoMessageMutation } from "@/lib/auto-message.api";
import { AutoMessage, Widget } from "@/types";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { AUTO_MESSAGES_QUERY_KEY } from "@/lib/auto-message.api";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface EditAutoMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  autoMessage: AutoMessage;
  widgets: Widget[];
}

// Validation schema
const editAutoMessageSchema = z.object({
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  widgetId: z.string().min(1, "Widget is required"),
  domain: z.string().min(1, "Domain is required"),
  sitewide: z.boolean(),
  pagePaths: z.array(z.string()),
  showAfterSeconds: z.number().min(0, "Must be 0 or greater"),
  isEnabled: z.boolean(),
});

type EditAutoMessageFormData = z.infer<typeof editAutoMessageSchema>;

export default function EditAutoMessageDialog({
  open,
  onOpenChange,
  autoMessage,
  widgets,
}: EditAutoMessageDialogProps) {
  const [newPagePath, setNewPagePath] = useState("");
  const queryClient = useQueryClient();

  const form = useForm<EditAutoMessageFormData>({
    resolver: zodResolver(editAutoMessageSchema),
    defaultValues: {
      title: autoMessage?.title || "",
      message: autoMessage?.message || "",
      widgetId: autoMessage?.widgetId || "",
      domain: autoMessage?.domain || "",
      sitewide: autoMessage?.sitewide || false,
      pagePaths: autoMessage?.pagePaths || [],
      showAfterSeconds: autoMessage?.showAfterSeconds || 5,
      isEnabled: autoMessage?.isEnabled ?? true,
    },
  });



  const updateMutation = useUpdateAutoMessageMutation({
    onSuccess: () => {
      toast.success("Auto message updated successfully");
      queryClient.invalidateQueries({ queryKey: [AUTO_MESSAGES_QUERY_KEY] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update auto message");
    },
  });

  // Reset form when autoMessage changes
  useEffect(() => {
    if (autoMessage && form) {
      form.reset({
        title: autoMessage.title,
        message: autoMessage.message,
        widgetId: autoMessage.widgetId,
        domain: autoMessage.domain,
        sitewide: autoMessage.sitewide,
        pagePaths: autoMessage.pagePaths,
        showAfterSeconds: autoMessage.showAfterSeconds,
        isEnabled: autoMessage.isEnabled,
      });
    }
  }, [autoMessage, form]);

  const handleClose = () => {
    setNewPagePath("");
    onOpenChange(false);
  };

  const onSubmit = (data: EditAutoMessageFormData) => {
    if (!data.sitewide && data.pagePaths.length === 0) {
      toast.error("Please specify at least one page path or make it sitewide");
      return;
    }

    updateMutation.mutate({
      id: autoMessage._id,
      data: {
        title: data.title,
        message: data.message,
        widgetId: data.widgetId,
        domain: data.domain,
        sitewide: data.sitewide,
        pagePaths: data.pagePaths,
        showAfterSeconds: data.showAfterSeconds,
        isEnabled: data.isEnabled,
      },
    });
  };

  const addPagePath = () => {
    if (newPagePath.trim() && !form.getValues("pagePaths").includes(newPagePath.trim())) {
      const currentPaths = form.getValues("pagePaths");
      form.setValue("pagePaths", [...currentPaths, newPagePath.trim()]);
      setNewPagePath("");
    }
  };

  const removePagePath = (index: number) => {
    const currentPaths = form.getValues("pagePaths");
    form.setValue("pagePaths", currentPaths.filter((_, i) => i !== index));
  };

  const handleSitewideChange = (checked: boolean) => {
    form.setValue("sitewide", checked);
    if (checked) {
      form.setValue("pagePaths", []);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent key={autoMessage?._id} className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Auto Message</DialogTitle>
          <DialogDescription>
            Update the auto message settings and content.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter message title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Controller
                control={form.control}
                name="widgetId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Widget *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a widget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {widgets.map((widget) => (
                          <SelectItem key={widget._id} value={widget._id}>
                            {widget.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your message"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="domain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Domain *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="showAfterSeconds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Show After (seconds)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Enable auto message</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sitewide"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={handleSitewideChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Show on all pages (sitewide)</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {!form.watch("sitewide") && (
              <div className="space-y-2">
                <Label>Page Paths</Label>
                <div className="flex gap-2">
                  <Input
                    value={newPagePath}
                    onChange={(e) => setNewPagePath(e.target.value)}
                    placeholder="Enter page path (e.g., /about, /contact)"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPagePath())}
                  />
                  <Button type="button" onClick={addPagePath} variant="outline">
                    Add
                  </Button>
                </div>
                
                {form.watch("pagePaths").length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {form.watch("pagePaths").map((path, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {path}
                        <button
                          type="button"
                          onClick={() => removePagePath(index)}
                          className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Auto Message"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


