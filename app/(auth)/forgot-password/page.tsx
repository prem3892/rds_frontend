"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Mail } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

const forgotPasswordFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  })

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    toast("Reset Link Sent!", {
      description: `Password reset link has been sent to ${data.email}`,
    })
    router.push("/login")
  }

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
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Forgot password</h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Don't worry! It happens. please enter the address associated with your account.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        {...field}
                        type="email"
                        placeholder="christinhume@02gmail.com"
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
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Send
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/login")}
                className="w-full h-12 bg-white border border-gray-200 text-blue-600 font-medium rounded-lg hover:bg-gray-50"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </motion.div>
    </div>
  )
}
