// src/app/dashboard/(admin)/departments/page.tsx
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
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import {
  useGetAllDepartments,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  DEPARTMENTS_QUERY_KEY,
} from "@/lib/api";
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Edit,
  Trash2,
  PlusCircle,
  Building2,
  Loader2,
  AlertTriangle,
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

// Zod schema for department form validation
const departmentFormSchema = z.object({
  name: z.string().min(1, { message: "Department name is required." }),
  description: z.string().optional(),
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

export default function DepartmentsPage() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(
    null
  );

  const {
    data: departments,
    isLoading: isLoadingDepartments,
    error: departmentsError,
  } = useGetAllDepartments({
    enabled: currentUser?.role === "ADMIN", // Only load if admin
  });

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createDepartmentMutation = useCreateDepartmentMutation({
    onSuccess: () => {
      toast.success("Department Created", {
        description: "The new department has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to create department", {
        description: error.message,
      });
    },
  });

  const updateDepartmentMutation = useUpdateDepartmentMutation({
    onSuccess: () => {
      toast.success("Department Updated", {
        description: "The department has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      setIsDialogOpen(false);
      setEditingDepartment(null);
      form.reset();
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message,
      });
    },
  });

  const deleteDepartmentMutation = useDeleteDepartmentMutation({
    onSuccess: () => {
      toast.success("Department Deleted");
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error("Deletion Failed", {
        description: error.message,
      });
    },
  });

  const handleFormSubmit = (values: DepartmentFormValues) => {
    if (editingDepartment) {
      updateDepartmentMutation.mutate({
        id: editingDepartment._id,
        data: values as UpdateDepartmentDto,
      });
    } else {
      createDepartmentMutation.mutate(values as CreateDepartmentDto);
    }
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    form.reset({
      name: department.name,
      description: department.description || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (departmentId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this department? This action cannot be undone."
      )
    ) {
      deleteDepartmentMutation.mutate(departmentId);
    }
  };

  if (currentUser?.role !== "ADMIN") {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to manage departments.
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
          <Building2 className="mr-3 h-7 w-7 text-primary" /> Manage Departments
        </h1>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              setEditingDepartment(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingDepartment(null);
                form.reset();
                setIsDialogOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Department
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingDepartment
                  ? "Edit Department"
                  : "Create New Department"}
              </DialogTitle>
              <DialogDescription>
                {editingDepartment
                  ? "Update the department details below."
                  : "Create a new department for categorizing chat requests."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6 py-4"
              >
                {/* Department Name */}
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Sales, Support, Technical"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Department Description */}
                <FormField
                  name="description"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the purpose of this department"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description of this department&apos;s purpose
                        and responsibilities.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={
                      createDepartmentMutation.isPending ||
                      updateDepartmentMutation.isPending
                    }
                  >
                    {(createDepartmentMutation.isPending ||
                      updateDepartmentMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {editingDepartment
                      ? "Update Department"
                      : "Create Department"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Departments</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingDepartments && (
            <p className="text-center text-muted-foreground">
              Loading departments...
            </p>
          )}
          {departmentsError && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{departmentsError.message}</AlertDescription>
            </Alert>
          )}
          {!isLoadingDepartments && departments && departments.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-lg font-medium">No departments found</p>
              <p className="text-sm text-muted-foreground mt-1">
                You haven&apos;t created any departments yet.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setIsDialogOpen(true)}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First
                Department
              </Button>
            </div>
          )}
          {departments && departments.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departments.map((department) => (
                  <TableRow key={department._id}>
                    <TableCell className="font-medium">
                      {department.name}
                    </TableCell>
                    <TableCell>
                      {department.description ? (
                        department.description
                      ) : (
                        <span className="text-muted-foreground italic">
                          No description
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {format(parseISO(department.createdAt), "PPP")}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(department)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(department._id)}     
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
