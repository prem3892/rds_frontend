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
import { AGENTS_QUERY_KEY, RegisterAgentDto, useRegisterAgentMutation } from "@/lib/agent.api";
import { Department } from "@/types";
import { AgentShift } from "@/types/agent";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { AgentShiftsForm } from "./agent-shifts-form";

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

// Zod schema for creating new agents
const createAgentFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  phoneNo: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  departmentIds: z.array(z.string()),
  role: z.enum(["AGENT"]),
  shifts: z.array(agentShiftSchema).optional(),
  timezone: z.string().optional(),
});

type CreateAgentFormValues = z.infer<typeof createAgentFormSchema>;

interface CreateAgentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  departments: Department[];
}

const CreateAgentDialog = ({ open, onOpenChange, departments }: CreateAgentDialogProps) => {
  const queryClient = useQueryClient();

  const form = useForm<CreateAgentFormValues>({
    resolver: zodResolver(createAgentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      phoneNo: "",
      website: "",
      departmentIds: [],
      role: "AGENT",
      shifts: [],
      timezone: "America/New_York",
    },
  });

  const registerAgentMutation = useRegisterAgentMutation({
    onSuccess: () => {
      toast.success("Agent Created", {
        description: "The new agent has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: [AGENTS_QUERY_KEY] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create agent", {
        description: error.message,
      });
    },
  });

  const handleSubmit = (values: CreateAgentFormValues) => {
    const agentData: RegisterAgentDto = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      role: "AGENT",
      // Only include optional fields if they have values
      ...(values.phoneNo && values.phoneNo.trim() && { phoneNo: values.phoneNo.trim() }),
      ...(values.website && values.website.trim() && { website: values.website.trim() }),
      ...(values.shifts && values.shifts.length > 0 && { shifts: values.shifts }),
      ...(values.timezone && { timezone: values.timezone }),
    };

    registerAgentMutation.mutate(agentData);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      form.reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Agent</DialogTitle>
          <DialogDescription>
            Add a new agent to handle customer chat requests.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 py-4"
          >
            {/* First Name */}
            <FormField
              name="firstName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="First name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              name="lastName"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
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

            {/* Password */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Create a secure password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Password must be at least 8 characters.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone Number */}
            <FormField
              name="phoneNo"
              control={form.control}
              render={({ field }) => (
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
              )}
            />

            {/* Website */}
            <FormField
              name="website"
              control={form.control}
              render={({ field }) => (
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
              )}
            />

            {/* Departments */}
            {departments && departments.length > 0 && (
              <FormField
                name="departmentIds"
                control={form.control}
                render={() => (
                  <FormItem>
                    <FormLabel>Departments</FormLabel>
                    <div className="space-y-2">
                      {departments.map((department: Department) => (
                        <FormField
                          key={department._id}
                          name="departmentIds"
                          control={form.control}
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={department._id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(
                                      department._id
                                    )}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([
                                            ...(field.value || []),
                                            department._id,
                                          ])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) =>
                                                value !== department._id
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {department.name}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormDescription>
                      Select the departments this agent will handle.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Agent Shifts */}
            <AgentShiftsForm control={form.control} name="shifts" />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={registerAgentMutation.isPending}
              >
                {registerAgentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Create Agent
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateAgentDialog;
