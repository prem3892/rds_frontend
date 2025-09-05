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

import { useEmailVerificationMutation, useResendVerificationMutation } from "@/lib/api";
import { ApiErrorResponse } from "@/types";
import { AlertCircle, CheckCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const resendVerificationSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type ResendVerificationFormValues = z.infer<typeof resendVerificationSchema>;

type VerificationState = "loading" | "success" | "error" | "resend";

// Loading component for Suspense fallback
function VerifyEmailLoading() {
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
              <Mail className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">
              Please wait while we prepare the verification page.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Component that uses useSearchParams
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [verificationState, setVerificationState] = useState<VerificationState>("loading");
  const [userEmail, setUserEmail] = useState<string>("");

  const verifyMutation = useEmailVerificationMutation();
  const resendMutation = useResendVerificationMutation();

  const form = useForm<ResendVerificationFormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (token) {
      // Automatically verify the email when the page loads with a token
      verifyMutation.mutate(
        { token },
        {
          onSuccess: (response) => {
            setVerificationState("success");
            toast("Email verified successfully!", {
              description: response.message || "Your email has been verified. You can now log in.",
            });
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
              router.push("/login");
            }, 3000);
          },
          onError: (error: ApiErrorResponse) => {
            setVerificationState("error");
            toast.error("Email verification failed!", {
              description: error.message || "The verification link is invalid or has expired.",
              dismissible: true,
              duration: 5000,
              icon: <AlertCircle className="w-4 h-4" />,
            });
          },
        }
      );
    } else {
      // No token provided, show error
      setVerificationState("error");
    }
  }, [token, router]);

  const handleResendVerification = async (data: ResendVerificationFormValues) => {
    resendMutation.mutate(data, {
      onSuccess: (response) => {
        setUserEmail(data.email);
        setVerificationState("success");
        toast("Verification email sent!", {
          description: response.message || "Please check your email for the verification link.",
        });
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
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

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const renderContent = () => {
    switch (verificationState) {
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
                <Mail className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Verifying your email...
              </h2>
              <p className="text-gray-600">
                Please wait while we verify your email address.
              </p>
            </div>
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
                Email verified successfully!
              </h2>
              <p className="text-gray-600">
                {userEmail 
                  ? `A new verification email has been sent to ${userEmail}.`
                  : "Your email has been verified. You can now log in to your account."
                }
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
                Verification failed
              </h2>
              <p className="text-gray-600">
                The verification link is invalid or has expired. Please request a new verification email.
              </p>
            </div>
            <div className="space-y-4">
              <Button
                onClick={() => setVerificationState("resend")}
                variant="outline"
                className="w-full h-12"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Request New Verification Email
              </Button>
              <Button
                onClick={handleGoToLogin}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                Go to Login
              </Button>
            </div>
          </motion.div>
        );

      case "resend":
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Mail className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Resend Verification Email
              </h2>
              <p className="text-gray-600">
                Enter your email address to receive a new verification link.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleResendVerification)} className="space-y-4">
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

                <div className="space-y-3">
                  <Button
                    type="submit"
                    disabled={resendMutation.isPending}
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  >
                    {resendMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      "Send Verification Email"
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

// Main component that wraps VerifyEmailContent with Suspense
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailLoading />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
