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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormMessage,
    FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {  
  AGENTS_QUERY_KEY,
  UpdateAgentProfileDto,
  useGetAgentById,
  useUpdateAgentProfileMutation,
  useUploadProfilePictureMutation
} from "@/lib/agent.api";
import { Department } from "@/types";
import { AgentShift } from "@/types/agent";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Building,
  Globe, Loader2, MessageSquare,
  ShieldCheck, User
} from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AgentShiftsForm } from "./agent-shifts-form";
import { ProfilePictureUpload } from "./profile-picture-upload";
import { Select, SelectItem, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";

// Zod schema for time slots
const timeSlotSchema = z.object({
  startHour: z.number().min(0).max(23),
  startMinute: z.number().min(0).max(59),
  endHour: z.number().min(0).max(23),
  endMinute: z.number().min(0).max(59),
});

// Zod schema for agent shifts
const agentShiftSchema = z.object({
  dayOfWeek: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  isWorkingDay: z.boolean(),
  timeSlots: z.array(timeSlotSchema),
  isActive: z.boolean(),
  priority: z.number(),
  description: z.string().optional(),
});

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
  phoneNo: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  departmentIds: z.array(z.string()),
  domainAccess: z.array(z.string()),
  maxConcurrentChats: z
    .number()
    .min(1, { message: "Must handle at least 1 chat." }),
  shifts: z.array(agentShiftSchema).optional(),
  timezone: z.string().optional(),
  profilePicture: z.string().optional(),
  role: z.enum(["AGENT", "MANAGER"]).optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

// Loading skeleton component for the form
const EditAgentFormSkeleton = () => (
  <div className="space-y-6 py-4">
    {/* Profile Picture Section */}
    <div className="flex items-center space-x-4">
      <Skeleton className="h-20 w-20 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
    </div>

    {/* User Details Section */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>

    {/* Agent Settings Section */}
    <div className="space-y-4">
      <Skeleton className="h-6 w-32" />
      
      {/* Departments */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-24" />
        <div className="space-y-2 border p-3 rounded-md">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      {/* Domain Access */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-3 w-48" />
      </div>

      {/* Max Concurrent Chats */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-3 w-64" />
      </div>

    </div>

    {/* Agent Shifts Section */}
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Shift Cards */}
      {[1, 2].map((i) => (
        <div key={i} className="border border-dashed p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-8 w-8" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      ))}

      {/* Timezone */}
      <div className="border p-4 rounded-lg space-y-3">
        <Skeleton className="h-5 w-20" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>

    {/* Action Buttons */}
    <div className="flex justify-end">
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

interface EditAgentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agentId: string | null;
  departments: Department[];
}

const EditAgentForm = ({ open, onOpenChange, agentId, departments }: EditAgentFormProps) => {
  const queryClient = useQueryClient();
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  // Fetch agent data using the API
  const {
    data: agent,
    isLoading: isLoadingAgent,
    error: agentError,
  } = useGetAgentById(agentId!, {
    enabled: !!agentId && open, // Only fetch when we have an agentId and modal is open
  });

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNo: "",
      website: "",
      departmentIds: [],
      domainAccess: [],
      maxConcurrentChats: 3,
      shifts: [],
      timezone: "America/New_York",
      profilePicture: "",
      role: undefined, // Don't set a default role initially
    },
  });

  const uploadProfilePictureMutation = useUploadProfilePictureMutation({
    onError: (error) => {
      toast.error("Failed to upload profile picture", {
        description: error.message,
      });
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
      setProfilePictureFile(null);
      setProfilePictureUrl(null);
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const handleSubmit = async (values: AgentFormValues) => {
    if (!agent || !agentId) {
      toast.error("No agent selected for editing.");
      return;
    }

    try {
      let finalProfilePictureUrl = "";

      // Handle profile picture changes
      if (profilePictureFile) {
        // New file uploaded - upload it
        const uploadResult = await uploadProfilePictureMutation.mutateAsync(profilePictureFile);
        finalProfilePictureUrl = uploadResult.profilePictureUrl;
      } else if (profilePictureUrl === null) {
        // User removed the profile picture - set empty string
        finalProfilePictureUrl = "";
      } else {
        // Keep existing profile picture
        finalProfilePictureUrl = agent.profilePicture || "";
      }

      const processedValues: UpdateAgentProfileDto = {
        firstName: values.firstName,
        lastName: values.lastName,
        // email: values.email,
        departmentIds: values.departmentIds,
        domainAccess: values.domainAccess
          .filter((domain) => domain.trim() !== "")
          .map((d) => d.trim()),
        maxConcurrentChats: values.maxConcurrentChats,
        // Only include optional fields if they have values
        ...(values.phoneNo && values.phoneNo.trim() && { phoneNo: values.phoneNo.trim() }),
        ...(values.website && values.website.trim() && { website: values.website.trim() }),
        ...(values.role && { role: values.role }),
        shifts: values.shifts || [],
        ...(values.timezone && { timezone: values.timezone }),
        // Always include profilePicture - either new URL, existing URL, or empty string
        profilePicture: finalProfilePictureUrl,
      };

      // Only include password if it was provided and not empty
      // if (values.password && values.password.trim() !== "") {
      //   processedValues.password = values.password;
      // }

      updateAgentMutation.mutate({
        agentId: agent._id,
        data: processedValues,
      });
    } catch (error) {
      // Error handling is done in the mutation onError callbacks
      console.error("Error updating agent:", error);
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      // Reset form to default values when closing
      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phoneNo: "",
        website: "",
        departmentIds: [],
        domainAccess: [],
        maxConcurrentChats: 3,
        shifts: [],
        timezone: "America/New_York",
        profilePicture: "",
        role: undefined, // Don't set a default role
      });
      setProfilePictureFile(null);
      setProfilePictureUrl(null);
    }
  };

  const handleProfilePictureChange = (file: File | null, previewUrl?: string) => {
    setProfilePictureFile(file);
    setProfilePictureUrl(previewUrl || null);
  };

  // Update form when agent changes
  React.useEffect(() => {
    if (agent && open) {
      console.log("Agent data loaded:", agent);
      console.log("Agent role:", agent.user.role);
      
      // Process departmentIds based on whether they are objects or strings
      let deptIds = agent.departmentIds || [];
      if (deptIds.length > 0 && typeof deptIds[0] === "object") {
        // Extract just the IDs from the department objects
        deptIds = deptIds.map((dept: any) => dept._id);
      }

      const formData = {
        firstName: agent.user.firstName || "",
        lastName: agent.user.lastName || "",
        email: agent.user.email || "",
        phoneNo: agent.phoneNo || "",
        website: agent.website || "",
        departmentIds: deptIds,
        domainAccess: agent.domainAccess || [],
        maxConcurrentChats: agent.maxConcurrentChats || 3,
        shifts: agent.shifts || [],
        timezone: agent.timezone || "America/New_York",
        profilePicture: agent.profilePicture || "",
        role: agent.user.role! as "AGENT" | "MANAGER",
      };
      
      console.log("Form data being set:", formData);
      form.reset(formData);
      
      // Explicitly set the role field to ensure it updates properly
      setTimeout(() => {
        form.setValue("role", agent.user.role! as "AGENT" | "MANAGER");
        console.log("Role explicitly set to:", agent.user.role);
      }, 0);

      // Set the profile picture URL for display
      setProfilePictureUrl(agent.profilePicture || null);
    }
  }, [agent, open, form]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Agent Profile</DialogTitle>
          <DialogDescription>
            Update the configuration for this agent.
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoadingAgent && <EditAgentFormSkeleton />}

        {/* Error State */}
        {agentError && (
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-800">
                <strong>Error:</strong> {agentError.message || "Failed to load agent data"}
              </div>
            </div>
          </div>
        )}

        {/* Form - only show when we have agent data */}
        {agent && !isLoadingAgent && !agentError && (
          <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            {/* Profile Picture Upload */}
            <ProfilePictureUpload
              value={profilePictureUrl || ""}
              onChange={handleProfilePictureChange}
              disabled={updateAgentMutation.isPending || uploadProfilePictureMutation.isPending}
            />
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
                      disabled
                      // value={agent?.user.email || ""}
                        type="email"
                        placeholder="agent@example.com"

                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
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
              /> */}

              <FormField
                name="phoneNo"
                control={form.control}
                render={({ field }) => {
                  console.log("Phone field value:", field.value);
                  return (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          placeholder="+1234567890"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                name="website"
                control={form.control}
                render={({ field }) => {
                  console.log("Website field value:", field.value);
                  return (
                    <FormItem>
                      <FormLabel>Website (Optional)</FormLabel>
                      <FormControl>
                        <Input
                          type="url"
                          placeholder="https://example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

              <FormField
                name="role"
                control={form.control}
                render={({ field }) => {
                  console.log("Role field value:", field.value);
                  return (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Select 
                          onValueChange={field.onChange} 
                          value={field.value || ""}
                          key={field.value || "empty"} // Force re-render when value changes
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AGENT">Agent</SelectItem>
                            <SelectItem value="MANAGER">Manager</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Select the role for this user.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />


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
                        value={field.value?.join(", ") || ""}
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

            </div>

            {/* Agent Shifts */}
            <AgentShiftsForm control={form.control} name="shifts" />

            <DialogFooter>
              <Button type="submit" disabled={updateAgentMutation.isPending || uploadProfilePictureMutation.isPending}>
                {(updateAgentMutation.isPending || uploadProfilePictureMutation.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditAgentForm;
