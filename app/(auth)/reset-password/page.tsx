"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
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

import { useResetPasswordMutation } from "@/lib/api";
import { ApiErrorResponse } from "@/types";
import { AlertCircle, CheckCircle, Loader2, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const resetPasswordSchema = z.object({
  newPassword: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

type ResetState = "loading" | "form" | "success" | "error";

// Loading component for Suspense fallback
function ResetPasswordLoading() {
  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
              <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">
              Please wait while we prepare the password reset page.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Component that uses useSearchParams
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [resetState, setResetState] = useState<ResetState>("loading");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetMutation = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (token) {
      // Token is present, show the form
      setResetState("form");
    } else {
      // No token provided, show error
      setResetState("error");
    }
  }, [token]);

  const handlePasswordReset = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error("Invalid reset token");
      return;
    }

    resetMutation.mutate(
      { token, newPassword: data.newPassword },
      {
        onSuccess: (response) => {
          setResetState("success");
          toast("Password reset successful!", {
            description: response.message || "Your password has been reset successfully. You can now log in.",
          });
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login");
          }, 3000);
        },
        onError: (error: ApiErrorResponse) => {
          toast.error("Password reset failed!", {
            description: error.message || "The reset link is invalid or has expired.",
            dismissible: true,
            duration: 5000,
            icon: <AlertCircle className="w-4 h-4" />,
          });
        },
      }
    );
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const renderContent = () => {
    switch (resetState) {
      case "loading":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <Lock className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Preparing password reset...
              </h2>
              <p className="text-gray-600">
                Please wait while we validate your reset token.
              </p>
            </div>
          </motion.div>
        );

      case "form":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Lock className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Reset Your Password
              </h2>
              <p className="text-gray-600">
                Enter your new password below.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handlePasswordReset)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your new password"
                            className="pl-10 pr-10 h-12 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            {...field}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your new password"
                            className="pl-10 pr-10 h-12 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={resetMutation.isPending}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {resetMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleGoToLogin}
                    variant="outline"
                    className="w-full h-12"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        );

      case "success":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Password reset successful!
              </h2>
              <p className="text-gray-600">
                Your password has been reset successfully. You can now log in with your new password.
              </p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleGoToLogin}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Go to Login
              </Button>
              <p className="text-sm text-gray-500">
                Redirecting automatically in a few seconds...
              </p>
            </div>
          </motion.div>
        );

      case "error":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-6"
          >
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Invalid Reset Link
              </h2>
              <p className="text-gray-600">
                The password reset link is invalid or has expired. Please request a new password reset.
              </p>
            </div>
            <div className="space-y-4">
              <Link href="/forgot-password">
                <Button
                  variant="outline"
                  className="w-full h-12"
                >
                  Request New Reset Link
                </Button>
              </Link>
              <Button
                onClick={handleGoToLogin}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Go to Login
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-white">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Mobile logo for small screens */}
        <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
          <Image
            src="/ConvoiaChat-logo-horizontal-white-bg.svg"
            alt="Convoia Chat Logo"
            width={120}
            height={50}
          />
        </div>

        {renderContent()}
      </motion.div>
    </div>
  );
}

// Main component that wraps ResetPasswordContent with Suspense
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordLoading />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
