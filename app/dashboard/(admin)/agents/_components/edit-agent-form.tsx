"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { 
  useUpdateAgentProfileMutation, 
  UpdateAgentProfileDto,
  AgentProfile 
} from "@/lib/agent.api";
import { Department } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { AGENTS_QUERY_KEY } from "@/lib/agent.api";
import { 
  User, 
  Building, 
  Globe, 
  MessageSquare, 
  ShieldCheck 
} from "lucide-react";

// Zod schema for agent form validation (for editing existing agents)
const agentFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .refine((val) => val === "" || val.length >= 8, {
      message: "Password must be at least 8 characters if provided.",
    })
    .optional(),
  departmentIds: z.array(z.string()),
  domainAccess: z.array(z.string()),
  isOnline: z.boolean(),
  maxConcurrentChats: z
    .number()
    .min(1, { message: "Must handle at least 1 chat." }),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

interface EditAgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent: AgentProfile | null;
  departments: Department[];
}

const EditAgentForm = ({ open, onOpenChange, agent, departments }: EditAgentFormProps) => {
  const queryClient = useQueryClient();

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      departmentIds: [],
      domainAccess: [],
      isOnline: false,
      maxConcurrentChats: 3,
    },
  });

  const updateAgentMutation = useUpdateAgentProfileMutation({
    onSuccess: () => {
      toast("Agent Updated", {
        description: "The agent profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [AGENTS_QUERY_KEY] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (values: AgentFormValues) => {
    if (!agent) {
      toast.error("No agent selected for editing.");
      return;
    }

    const processedValues: UpdateAgentProfileDto = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      departmentIds: values.departmentIds,
      domainAccess: values.domainAccess
        .filter((domain) => domain.trim() !== "")
        .map((d) => d.trim()),
      isOnline: values.isOnline,
      maxConcurrentChats: values.maxConcurrentChats,
    };

    // Only include password if it was provided and not empty
    if (values.password && values.password.trim() !== "") {
      processedValues.password = values.password;
    }

    updateAgentMutation.mutate({
      agentId: agent._id,
      data: processedValues,
    });
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
    }
  };

  // Update form when agent changes
  React.useEffect(() => {
    if (agent && open) {
      // Process departmentIds based on whether they are objects or strings
      let deptIds = agent.departmentIds || [];
      if (deptIds.length > 0 && typeof deptIds[0] === "object") {
        // Extract just the IDs from the department objects
        deptIds = deptIds.map((dept: any) => dept._id);
      }

      form.reset({
        firstName: agent.user.firstName || "",
        lastName: agent.user.lastName || "",
        email: agent.user.email || "",
        departmentIds: deptIds,
        domainAccess: agent.domainAccess || [],
        isOnline: agent.isOnline || false,
        maxConcurrentChats: agent.maxConcurrentChats || 3,
        password: "", // Always reset password field
      });
    }
  }, [agent, open, form]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent Profile</DialogTitle>
          <DialogDescription>
            Update the configuration for this agent.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            {/* User Details Section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <User className="mr-2 h-4 w-4" /> User Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  name="firstName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="First Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="lastName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Last Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                name="email"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="agent@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="password"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 8 characters. Leave blank to keep current
                      password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Agent Settings Section */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center">
                <ShieldCheck className="mr-2 h-4 w-4" /> Agent Settings
              </h3>

              <FormField
                name="departmentIds"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Building className="mr-2 h-4 w-4" /> Departments
                    </FormLabel>
                    {departments && departments.length > 0 ? (
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
                                  const currentValue = field.value || [];
                                  const updatedDepts = checked
                                    ? [...currentValue, dept._id]
                                    : currentValue.filter(
                                        (id) => id !== dept._id
                                      );
                                  field.onChange(updatedDepts);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              {dept.name}
                            </FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        No departments available.
                      </p>
                    )}
                    <FormDescription>
                      Select which departments this agent belongs to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="domainAccess"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <Globe className="mr-2 h-4 w-4" /> Domain Access
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="example.com, *.sub.example.com (comma-separated)"
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
                      Domains this agent can access. Leave empty for all
                      domains.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="maxConcurrentChats"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
                      <MessageSquare className="mr-2 h-4 w-4" /> Max
                      Concurrent Chats
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 1)
                        }
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of chats this agent can handle
                      simultaneously.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="isOnline"
                control={form.control}
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Online Status</FormLabel>
                      <FormDescription>
                        Set agent as online or offline.
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

            <DialogFooter>
              <Button type="submit" disabled={updateAgentMutation.isPending}>
                {updateAgentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentForm;
