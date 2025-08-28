// src/app/(auth)/initial-admin-signup/page.tsx
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

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

import { useInitialAdminSignupMutation } from "@/lib/api";
import {
  AdminRegisterDto,
  ApiErrorResponse,
  AdminSignupSuccessResponse,
} from "@/types"; // Updated types
import { Globe, Lock, Mail, Phone, User } from "lucide-react";

// Zod schema for form validation, matches AdminRegisterDto
const signupFormSchema = z
  .object({
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    email: z.string().email({ message: "Please enter a valid email address." }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters long." }),
    confirmPassword: z.string(), // Still useful for client-side validation
    phoneNo: z.string().optional(),
    website: z.string().min(1, { message: "Website is required." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
  })

// Form values type derived from schema
type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function InitialAdminSignupPage() {
  const router = useRouter();
  const initialAdminSignupMutation = useInitialAdminSignupMutation();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNo: "",
      website: "",
    },
    mode: "onChange",
  });

  const onSubmit = async (formData: SignupFormValues) => {
    // Destructure to get AdminRegisterDto fields, excluding confirmPassword
    const {
      confirmPassword,
      ...adminRegisterData
    }: { confirmPassword?: string } & AdminRegisterDto = formData;

    initialAdminSignupMutation.mutate(adminRegisterData, {
      onSuccess: (response: AdminSignupSuccessResponse) => {
        toast("Admin Account Created!", {
          description:
            response.firstName +
            " (" +
            response.email +
            ") created." +
            "\n\nPlease log in.",
          duration: 5000,
        });
        router.push("/login");
      },
      onError: (error: ApiErrorResponse) => {
        console.log(error);

        toast.error("Failed to create admin account.", {
          description: error.message,
          duration: 7000,
        });
      },
    });
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

        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Sign up your account</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700"> First Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="John"
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
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700"> Last Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          {...field}
                          type="text"
                          placeholder="Doe"
                          className="pl-10 h-12 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-500"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700"> Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="john@gmail.com"
                        className="pl-10 h-12 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700"> Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••••••"
                          className="pl-10 h-12 bg-gray-50 border-0 text-gray-900"
                        />
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
                    <FormLabel className="text-sm font-medium text-gray-700"> Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <Input
                          {...field}
                          type="password"
                          placeholder="••••••••••••"
                          className="pl-10 h-12 bg-gray-50 border-0 text-gray-900"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phoneNo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Phone No.</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+1 (123) 456-7890"
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
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700"> Your website</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        {...field}
                        type="url"
                        placeholder="https://www.yourwebsite.com"
                        className="pl-10 h-12 bg-gray-50 border-0 text-gray-900 placeholder:text-gray-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
            >
              Sign up
            </Button>

        

            

            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Log in
              </Link>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
