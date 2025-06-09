"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";

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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import {
  useGetAllAgents,
  useUpdateAgentProfileMutation,
  useSetAgentStatusMutation,
  AGENTS_QUERY_KEY,
  AgentProfile,
  UpdateAgentProfileDto,
} from "@/lib/api";
import { useGetAllDepartments } from "@/lib/department.api";
import { useRegisterAgentMutation, RegisterAgentDto } from "@/lib/agent.api";
import { Department } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  Trash2,
  PlusCircle,
  Settings2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  Users,
  Mail,
  Phone,
  Globe,
  User,
  Building,
  ToggleLeft,
  MessageSquare,
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
import { Checkbox } from "@/components/ui/checkbox";

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
  departmentIds: z.array(z.string()).default([]),
  domainAccess: z.array(z.string()).default([]),
  isOnline: z.boolean().default(false),
  maxConcurrentChats: z
    .number()
    .min(1, { message: "Must handle at least 1 chat." })
    .default(3),
});

// Zod schema for creating new agents
const createAgentFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  departmentIds: z.array(z.string()).default([]),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;
type CreateAgentFormValues = z.infer<typeof createAgentFormSchema>;

export default function AgentsPage() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);

  const {
    data: agents,
    isLoading: isLoadingAgents,
    error: agentsError,
  } = useGetAllAgents({
    enabled: currentUser?.role === "ADMIN",
  });

  const { data: departments, isLoading: isLoadingDepartments } =
    useGetAllDepartments({
      enabled: currentUser?.role === "ADMIN",
    });

  // Form for editing existing agents
  const form = useForm({
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

  // Form for creating new agents
  const createForm = useForm({
    resolver: zodResolver(createAgentFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      departmentIds: [],
    },
  });

  const domainsString = form.watch("domainAccess")?.join(", ") || "";

  const updateAgentMutation = useUpdateAgentProfileMutation({
    onSuccess: () => {
      toast("Agent Updated", {
        description: "The agent profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [AGENTS_QUERY_KEY] });
      setIsDialogOpen(false);
      setEditingAgent(null);
      form.reset();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const setAgentStatusMutation = useSetAgentStatusMutation({
    onSuccess: () => {
      toast("Status Updated", {
        description: "Agent online status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: [AGENTS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error("Status Update Failed", {
        description: error.message,
      });
    },
  });

  const registerAgentMutation = useRegisterAgentMutation({
    onSuccess: () => {
      toast.success("Agent Created", {
        description: "The new agent has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: [AGENTS_QUERY_KEY] });
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast.error("Failed to create agent", {
        description: error.message,
      });
    },
  });

  const handleFormSubmit = (values: AgentFormValues) => {
    if (!editingAgent) {
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
      agentId: editingAgent._id,
      data: processedValues,
    });
  };

  const handleEdit = (agent: AgentProfile) => {
    setEditingAgent(agent);

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
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (agent: AgentProfile) => {
    setAgentStatusMutation.mutate({
      isOnline: !agent.isOnline,
    });
  };

  const handleCreateAgentSubmit = (values: CreateAgentFormValues) => {
    const agentData: RegisterAgentDto = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
      role: "AGENT",
    };

    registerAgentMutation.mutate(agentData);
  };

  if (currentUser?.role !== "ADMIN") {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to manage agents.
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
          <Users className="mr-3 h-7 w-7 text-primary" /> Manage Agents
        </h1>
        <Dialog
          open={isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) {
              createForm.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Agent</DialogTitle>
              <DialogDescription>
                Add a new agent to handle customer chat requests.
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form
                onSubmit={createForm.handleSubmit(handleCreateAgentSubmit)}
                className="space-y-6 py-4"
              >
                {/* First Name */}
                <FormField
                  name="firstName"
                  control={createForm.control}
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
                  control={createForm.control}
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
                  control={createForm.control}
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
                  control={createForm.control}
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

                {/* Departments */}
                {departments && departments.length > 0 && (
                  <FormField
                    name="departmentIds"
                    control={createForm.control}
                    render={() => (
                      <FormItem>
                        <FormLabel>Departments</FormLabel>
                        <div className="space-y-2">
                          {departments.map((department: Department) => (
                            <FormField
                              key={department._id}
                              name="departmentIds"
                              control={createForm.control}
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

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
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
      </div>

      {isLoadingAgents ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading agents...</span>
        </div>
      ) : agentsError ? (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load agents. Please try again.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Agent Profiles</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Departments</TableHead>
                  <TableHead>Domain Access</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Max Chats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agents && agents.length > 0 ? (
                  agents.map((agent) => (
                    <TableRow key={agent._id}>
                      <TableCell className="font-medium">
                        {agent.user.firstName} {agent.user.lastName}
                      </TableCell>
                      <TableCell>{agent.user.email}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {agent.departmentIds.length > 0 ? (
                            Array.isArray(agent.departmentIds) &&
                            typeof agent.departmentIds[0] === "object" ? (
                              // Handle case where departmentIds is an array of department objects
                              agent.departmentIds.map((dept: any) => (
                                <Badge
                                  key={dept._id}
                                  variant="outline"
                                  className="mr-1"
                                >
                                  {dept.name}
                                </Badge>
                              ))
                            ) : (
                              // Handle case where departmentIds is an array of IDs
                              departments
                                ?.filter((dept: Department) =>
                                  agent.departmentIds.includes(dept._id)
                                )
                                .map((dept: Department) => (
                                  <Badge
                                    key={dept._id}
                                    variant="outline"
                                    className="mr-1"
                                  >
                                    {dept.name}
                                  </Badge>
                                ))
                            )
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              None
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {agent.domainAccess &&
                          agent.domainAccess.length > 0 ? (
                            agent.domainAccess.map((domain, idx) => (
                              <Badge
                                key={idx}
                                variant="secondary"
                                className="mr-1"
                              >
                                {domain}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              All domains
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={agent.isOnline ? "default" : "secondary"}
                          className="font-normal"
                        >
                          {agent.isOnline ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">
                          <MessageSquare className="h-3 w-3 mr-1" />{" "}
                          {agent.maxConcurrentChats}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(agent)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={agent.isOnline ? "destructive" : "default"}
                            size="icon"
                            onClick={() => handleToggleStatus(agent)}
                          >
                            <ToggleLeft className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <Users className="h-10 w-10 mb-2 opacity-40" />
                        <p>No agents found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingAgent(null);
            form.reset();
          }
        }}
      >
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Agent Profile</DialogTitle>
            <DialogDescription>
              Update the configuration for this agent.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
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
                      {isLoadingDepartments ? (
                        <p className="text-sm text-muted-foreground">
                          Loading departments...
                        </p>
                      ) : departments && departments.length > 0 ? (
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
    </motion.div>
  );
}
