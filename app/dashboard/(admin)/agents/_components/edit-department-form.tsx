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
import { useUpdateDepartmentMutation, DEPARTMENTS_QUERY_KEY } from "@/lib/department.api";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Department } from "@/types";

interface EditDepartmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export default function EditDepartmentForm({
  open,
  onOpenChange,
  department,
}: EditDepartmentFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const updateDepartmentMutation = useUpdateDepartmentMutation({
    onSuccess: () => {
      toast("Department Updated", {
        description: "Department has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_QUERY_KEY] });
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error("Update Failed", {
        description: error.message || "Failed to update department.",
      });
    },
  });

  // Update form data when department changes
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        description: department.description || "",
      });
    }
  }, [department]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) return;

    if (!formData.name.trim()) {
      toast.error("Validation Error", {
        description: "Department name is required.",
      });
      return;
    }

    updateDepartmentMutation.mutate({
      id: department._id,
      data: {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      },
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!department) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>
            Update the department information below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Department Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Enter department name"
                disabled={updateDepartmentMutation.isPending}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Enter department description (optional)"
                rows={3}
                disabled={updateDepartmentMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateDepartmentMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateDepartmentMutation.isPending || !formData.name.trim()}
            >
              {updateDepartmentMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Update Department
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
