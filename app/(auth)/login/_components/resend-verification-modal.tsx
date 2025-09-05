"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

import { useResendVerificationMutation } from "@/lib/api";
import { ApiErrorResponse } from "@/types";
import { AlertCircle, Loader2, Mail, X } from "lucide-react";

const resendVerificationSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;

interface ResendVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ResendVerificationModal({
  isOpen,
  onClose,
}: ResendVerificationModalProps) {
  const resendMutation = useResendVerificationMutation();

  const form = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (data: ResendVerificationFormValues) => {
    resendMutation.mutate(data, {
      onSuccess: (response) => {
        toast("Verification email sent!", {
          description: response.message || "Please check your email for the verification link.",
        });
        form.reset();
        onClose();
      },
      onError: (error: ApiErrorResponse) => {
        toast.error("Failed to send verification email!", {
          description: error.message || "An unknown error occurred.",
          dismissible: true,
          duration: 3000,
          icon: <AlertCircle className="w-4 h-4" />,
        });
      },
    });
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Resend Verification Email
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                Enter your email address to receive a new verification link.
              </DialogDescription>
            </div>
           
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="Enter your email address"
                        className="pl-10 h-12 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 h-12"
                disabled={resendMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={resendMutation.isPending}
                className="flex-1 h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                {resendMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  "Send Verification Email"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
