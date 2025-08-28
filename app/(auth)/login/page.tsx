// src/app/(auth)/login/page.tsx
"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import { useLoginMutation } from "@/lib/api";
import { ApiErrorResponse } from "@/types";
import Link from "next/link";
import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Image from "next/image";

// Zod schema for form validation based on LoginDto
const loginFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange", // Validate on change for better UX
  });

  const onSubmit = async (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: (response) => {
        toast("Login Successful!", {
          description: `Welcome back, ${response.user.firstName}. Redirecting...`,
        });

        // ALL users now go to /dashboard. The layout will handle role-specific views.
        router.push("/dashboard/chat");
      },
      onError: (error: ApiErrorResponse) => {
        toast.error("Login failed!", {
          description: error.message || "An unknown error occurred.",
          dismissible: true,
          duration: 3000,
          icon: <AlertCircle className="w-4 h-4" />,

        });
      },
    });
  };

  return (
    <>
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

          <div className="text-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-2">
              Log in your account
            </h1>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Email
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          {...field}
                          type="email"
                          placeholder="*Enter your email"
                          className="pl-10 h-12 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-500"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Password
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          {...field}
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          className="pl-10 pr-10 h-12 bg-gray-50 border-0 text-gray-900"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute cursor-pointer right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 text-gray-400 " />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400 " />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right">
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                disabled={loginMutation.isPending}

                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                {
                  loginMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : "Log in"
                }
              </Button>

            

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </>
  );
}
