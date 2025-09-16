"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useCreateWidgetMutation, WIDGETS_QUERY_KEY } from "@/lib/widget.api";
import { useGetAllDepartments } from "@/lib/department.api";
import { CreateWidgetDto, Department } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import {
  Palette,
  Globe,
  MessageSquareText,
  ShieldCheck,
  Settings2,
  ArrowLeft,
  Loader2,
  Send,
  Paperclip,
  Smile,
  Mail,
  MessageCircleCodeIcon,
  MessageCircleMoreIcon,
} from "lucide-react";
import { useCurrentUser } from "@/stores/auth";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { getInitials } from "@/lib/utils";

// Preset theme options
const THEME_PRESETS = {
  "Light blue": {
    primaryColor: "#3B82F6",
    secondaryColor: "#64748B",
  },
  "Sharp blue": {
    primaryColor: "#2563EB",
    secondaryColor: "#0EA5E9",
  },
  Custom: {
    primaryColor: "#3B82F6",
    secondaryColor: "#64748B",
  },
} as const;

// Zod schema for widget form validation
const widgetFormSchema = z.object({
  name: z.string().min(1, { message: "Widget name is required." }),
  domains: z.array(z.string()),
  departmentIds: z.array(z.string()),
  isEnabled: z.boolean(),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color." }),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color." }),
  themeName: z.enum(["Light blue", "Sharp blue", "Custom"]),
  welcomeMessage: z.string(),
  headerText: z.string(),
  offline_text: z.string(),
  notification_emails: z.array(z.string().email()),
  button_location: z.enum([
    "top_left",
    "top_right",
    "bottom_left",
    "bottom_right",
    "center_left",
    "center_right",
  ]),
  button_label: z.string(),
  widget_text_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, { message: "Invalid hex color." }),
});

type WidgetFormValues = z.infer<typeof widgetFormSchema>;

// Widget Preview Component
function WidgetPreview({ form }: { form: any }) {
  const watchedValues = form.watch();
  const {
    primaryColor = "#3B82F6",
    secondaryColor = "#64748B",
    headerText = "Customer Support",
    welcomeMessage = "Welcome! How can we help you today?",
    offline_text = "We are offline right now",
    button_label = "Chat with us",
    widget_text_color = "#FFFFFF",
  } = watchedValues;

  return (
    <div>
 <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg border overflow-hidden">
      <Tabs defaultValue="online" className="w-full">
        <TabsList className="grid gap-x-2 w-full grid-cols-2  bg-white rounded-t-lg p-2 pt-4 rounded-b-none">
          <TabsTrigger
            value="online"
            className="text-xs md:text-sm truncate  bg-gray-200 data-[state=active]:shadow-md data-[state=active]:p-2  data-[state=active]:mb-0 data-[state=active]:bg-white data-[state=active]:text-primary rounded-md"
          >
            Show Online widget
          </TabsTrigger>
          <TabsTrigger
            value="offline"
            className="text-xs md:text-sm truncate  bg-gray-200 data-[state=active]:shadow-md data-[state=active]:p-2  data-[state=active]:mb-0 data-[state=active]:bg-white data-[state=active]:text-primary rounded-md"
          >
            Show Offline widget
          </TabsTrigger>
        </TabsList>

        <TabsContent value="online" className="mt-0">
          <div className="flex flex-col  rounded-2xl p-4 gap-2">
            {/* Header */}
            <div
              className="px-4 py-3 rounded-2xl relative "
              style={{ background: primaryColor }}
            >
                <div className="absolute bottom-0 right-0">
                <svg
                  width={455}
                  height={95}
                  viewBox="0 0 455 95"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_201_2457"
                    style={{
                      maskType: "luminance",
                    }}
                    maskUnits="userSpaceOnUse"
                    x={-26}
                    y={-103}
                    width={484}
                    height={242}
                  >
                    <path d="M458 -103H-26V139H458V-103Z" fill="white" />
                  </mask>
                  <g mask="url(#mask0_201_2457)">
                    <path
                      opacity={0.1}
                      d="M-34.3301 146.831C-17.936 97.2259 2.87125 81.379 19.587 76.5615C47.7246 68.4522 66.7638 90.8747 91.1819 79.2132C119.5 65.689 109.05 28.2932 134.05 15.1314C169.485 -3.52394 215.128 58.6243 251.166 41.648C284.154 26.1083 268.591 -36.6511 299.779 -48.9505C330.239 -60.9625 360.228 -7.0736 400.543 -13.153C421.81 -16.3601 448.528 -36.6441 473.021 -110.823"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-27.7109 156.919C-11.3169 107.314 9.49039 91.4674 26.2062 86.6499C54.3438 78.5406 73.383 100.963 97.801 89.3016C126.119 75.7774 115.669 38.3817 140.67 25.2197C176.104 6.56431 221.747 68.7126 257.785 51.7364C290.773 36.1967 275.21 -26.5627 306.399 -38.8621C336.858 -50.8741 366.847 3.01478 407.162 -3.06463C428.429 -6.27173 455.147 -26.5557 479.641 -100.734"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-21.0918 167.007C-4.69775 117.402 16.1095 101.556 32.8253 96.7381C60.9628 88.6288 80.0021 111.051 104.42 99.3898C132.738 85.8657 122.288 48.47 147.289 35.308C182.723 16.6526 228.366 78.801 264.404 61.8247C297.392 46.285 281.829 -16.4744 313.018 -28.7739C343.478 -40.7859 373.466 13.103 413.781 7.02363C435.048 3.81653 461.767 -16.4676 486.26 -90.646"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-14.4707 177.098C1.92334 127.493 22.7306 111.646 39.4464 106.829C67.584 98.7193 86.6232 121.142 111.041 109.48C139.359 95.9561 128.909 58.5605 153.91 45.3984C189.345 26.743 234.987 88.8914 271.025 71.9151C304.013 56.3754 288.45 -6.38399 319.639 -18.6834C350.099 -30.6954 380.087 23.1935 420.402 17.1141C441.669 13.907 468.388 -6.37697 492.881 -80.5555"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-7.85156 187.184C8.54249 137.579 29.3498 121.732 46.0655 116.915C74.2031 108.805 93.2424 131.228 117.66 119.566C145.979 106.042 135.529 68.6466 160.529 55.4846C195.964 36.8292 241.606 98.9775 277.644 82.0013C310.632 66.4616 295.069 3.70219 326.258 -8.59722C356.718 -20.6093 386.707 33.2797 427.021 27.2003C448.288 23.9932 475.007 3.70908 499.5 -70.4694"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-1.23242 197.272C15.1616 147.668 35.9689 131.821 52.6847 127.003C80.8223 118.894 99.8615 141.316 124.28 129.655C152.598 116.131 142.148 78.735 167.148 65.573C202.583 46.9177 248.226 109.066 284.263 92.0897C317.251 76.55 301.689 13.7906 332.877 1.49115C363.337 -10.5209 393.326 43.368 433.64 37.2886C454.907 34.0815 481.626 13.7976 506.119 -60.381"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M5.38672 207.36C21.7808 157.756 42.588 141.909 59.3038 137.091C87.4414 128.982 106.481 151.405 130.899 139.743C159.217 126.219 148.767 88.8231 173.767 75.6612C209.202 57.0058 254.845 119.154 290.882 102.178C323.87 86.6382 308.308 23.8788 339.496 11.5794C369.956 -0.432622 399.945 53.4563 440.259 47.3769C461.526 44.1698 488.245 23.8858 512.738 -50.2927"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M12.0078 217.451C28.4019 167.846 49.2091 151.999 65.9249 147.182C94.0625 139.073 113.102 161.495 137.52 149.834C165.838 136.309 155.388 98.9137 180.388 85.7517C215.823 67.0964 261.466 129.245 297.504 112.268C330.492 96.7287 314.929 33.9693 346.117 21.6699C376.577 9.65784 406.566 63.5468 446.881 57.4674C468.148 54.2603 494.866 33.9763 519.359 -40.2023"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M18.627 227.539C35.021 177.935 55.8283 162.088 72.5441 157.27C100.682 149.161 119.721 171.584 144.139 159.922C172.457 146.398 162.007 109.002 187.008 95.8401C222.442 77.1847 268.085 139.333 304.123 122.357C337.111 106.817 321.548 44.0577 352.736 31.7583C383.196 19.7462 413.185 73.6351 453.5 67.5557C474.767 64.3486 501.485 44.0647 525.978 -30.1139"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M25.2461 237.625C41.6401 188.021 62.4474 172.174 79.1633 167.356C107.301 159.247 126.34 181.67 150.758 170.008C179.076 156.484 168.626 119.088 193.627 105.926C229.062 87.271 274.704 149.419 310.742 132.443C343.73 116.903 328.167 54.1438 359.356 41.8444C389.816 29.8324 419.804 83.7213 460.119 77.6419C481.386 74.4348 508.105 54.1509 532.598 -20.0277"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M31.8652 247.714C48.2593 198.109 69.0666 182.262 85.7823 177.445C113.92 169.335 132.959 191.758 157.377 180.096C185.695 166.572 175.245 129.177 200.246 116.015C235.681 97.3591 281.323 159.507 317.361 142.531C350.349 126.992 334.786 64.2321 365.975 51.9327C396.435 39.9206 426.423 93.8096 466.738 87.7302C488.005 84.5231 514.724 64.2391 539.217 -9.93945"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M38.4863 257.802C54.8804 208.197 75.6877 192.351 92.4034 187.533C120.541 179.424 139.58 201.846 163.998 190.185C192.317 176.661 181.866 139.265 206.867 126.103C242.302 107.448 287.944 169.596 323.982 152.62C356.97 137.08 341.407 74.3205 372.596 62.0211C403.056 50.009 433.045 103.898 473.359 97.8186C494.626 94.6114 521.345 74.3275 545.838 0.148926"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M45.1055 267.893C61.4995 218.288 82.3068 202.441 99.0226 197.623C127.16 189.514 146.199 211.937 170.618 200.275C198.936 186.751 188.486 149.355 213.486 136.193C248.921 117.538 294.564 179.686 330.601 162.71C363.589 147.17 348.027 84.4109 379.215 72.1115C409.675 60.0995 439.664 113.988 479.978 107.909C501.245 104.702 527.964 84.4179 552.457 10.2394"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M51.7246 277.981C68.1187 228.376 88.9259 212.529 105.642 207.712C133.779 199.602 152.819 222.025 177.237 210.364C205.555 196.839 195.105 159.444 220.105 146.282C255.54 127.626 301.183 189.775 337.22 172.798C370.208 157.259 354.646 94.4993 385.834 82.1999C416.294 70.1879 446.283 124.077 486.598 117.997C507.864 114.79 534.583 94.5063 559.076 20.3278"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M58.3438 288.067C74.7378 238.462 95.5451 222.616 112.261 217.798C140.398 209.689 159.438 232.111 183.856 220.45C212.174 206.926 201.724 169.53 226.724 156.368C262.159 137.712 307.802 199.861 343.84 182.885C376.828 167.345 361.265 104.585 392.453 92.2861C422.913 80.274 452.902 134.163 493.217 128.084C514.484 124.876 541.202 104.593 565.695 30.4139"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M64.9629 298.155C81.3569 248.551 102.164 232.704 118.88 227.886C147.018 219.777 166.057 242.2 190.475 230.538C218.793 217.014 208.343 179.618 233.343 166.456C268.778 147.801 314.421 209.949 350.459 192.973C383.447 177.433 367.884 114.674 399.072 102.374C429.532 90.3623 459.521 144.251 499.836 138.172C521.103 134.965 547.821 114.681 572.314 40.5022"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M71.584 308.246C87.978 258.641 108.785 242.794 125.501 237.977C153.639 229.867 172.678 252.29 197.096 240.628C225.414 227.104 214.964 189.709 239.965 176.547C275.399 157.891 321.042 220.04 357.08 203.063C390.068 187.524 374.505 124.764 405.693 112.465C436.153 100.453 466.142 154.342 506.457 148.262C527.724 145.055 554.442 124.771 578.936 50.5927"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M78.2031 318.334C94.5972 268.73 115.404 252.883 132.12 248.065C160.258 239.956 179.297 262.378 203.715 250.717C232.033 237.193 221.583 199.797 246.584 186.635C282.018 167.98 327.661 230.128 363.699 213.152C396.687 197.612 381.124 134.853 412.313 122.553C442.772 110.541 472.761 164.43 513.076 158.351C534.343 155.144 561.062 134.859 585.555 60.681"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M84.8223 328.422C101.216 278.818 122.024 262.971 138.739 258.153C166.877 250.044 185.916 272.467 210.334 260.805C238.652 247.281 228.202 209.885 253.203 196.723C288.638 178.068 334.28 240.216 370.318 223.24C403.306 207.7 387.743 144.941 418.932 132.641C449.392 120.629 479.381 174.518 519.695 168.439C540.962 165.232 567.681 144.948 592.174 70.7693"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M91.4414 338.511C107.835 288.906 128.643 273.059 145.359 268.242C173.496 260.132 192.535 282.555 216.953 270.893C245.272 257.369 234.822 219.974 259.822 206.812C295.257 188.156 340.899 250.305 376.937 233.328C409.925 217.789 394.362 155.029 425.551 142.73C456.011 130.718 486 184.607 526.314 178.527C547.581 175.32 574.3 155.036 598.793 80.8577"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M98.0625 348.597C114.457 298.992 135.264 283.145 151.98 278.328C180.117 270.219 199.156 292.641 223.574 280.98C251.893 267.455 241.443 230.06 266.443 216.898C301.878 198.242 347.521 260.391 383.558 243.415C416.546 227.875 400.984 165.115 432.172 152.816C462.632 140.804 492.621 194.693 532.935 188.613C554.202 185.406 580.921 165.122 605.414 90.9438"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                  </g>
                </svg>
              </div>
              <h3
                className="font-medium text-center"
                style={{ color: widget_text_color }}
              >
                {headerText}
              </h3>
              {/* Agent Avatars */}
              <div className="px-4 py-3">
              <div className="flex justify-center space-x-2 mb-2">
                {[
                  { name: "Alex", color: "from-blue-400 to-purple-500", imgSrc:"/_static/avatars/avatar-4.png" },
                  { name: "John", color: "from-green-400 to-blue-500" ,imgSrc:"/_static/avatars/avatar-2.png"},
                  { name: "Charlie", color: "from-purple-400 to-pink-500" ,imgSrc:"/_static/avatars/avatar-3.png"},
                ].map((agent, i) => (
                  <div className="flex flex-col items-center" key={i}>
                    <div key={i} className="relative">
                    <Avatar className="size-14 border-2 border-white shadow-sm">
                      <AvatarImage src={agent.imgSrc} />
                      {/* <AvatarFallback className={`text-white text-sm font-medium bg-gradient-to-br ${agent.color}`}>
                        {getInitials(agent.name)}
                      </AvatarFallback> */}
                    </Avatar>
                    {/* Green online status dot */}
                  
                    <div className="absolute -bottom-0.25 -right-0.25 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="text-sm text-white">
                    <p>{agent.name}</p>
                  </div>
                  </div>
                
                ))}
              </div>
              <p className="text-center text-sm" style={{ color: widget_text_color }}>
                {welcomeMessage}
              </p>
            </div>
            </div>

            {/* Chat Messages Area */}
            <div
              className="flex-1 px-4 py-12 pb-2 min-h-[300px] space-y-3  rounded-2xl"
              style={{ backgroundColor: secondaryColor + "10" }}
            >
              {/* email container to ask for email */}
              <div className="flex flex-col items-center space-x-2 bg-white rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  Please provide your email incase our chat gets interrupted
                </p>
                <div className="flex items-center space-x-2 w-full mt-2">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="text-sm bg-accent rounded-sm"
                  />
                  <Mail className="size-8 bg-primary text-white rounded-sm p-1" style={{ backgroundColor: primaryColor }} />
                </div>
              </div>

              {/* Incoming Message */}
              <div className="flex items-start space-x-2">
                <Avatar className="size-6">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-gradient-to-br from-orange-400 to-red-500 text-white text-xs font-medium">
                    L
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div
                    className="rounded-lg px-3 py-2 text-sm text-white"
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Lorem Ipsum is simply dummy text of the printing
                  </div>
                  <p className="text-xs mt-1">Leslie Alexander · 08:30AM</p>
                </div>
              </div>

              {/* Outgoing Message */}
              <div className="flex justify-end">
                <div className="max-w-xs">
                  <div
                    className="rounded-lg px-3 py-2 text-sm text-white"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Lorem Ipsum is simply dummy text of the printing and
                    typesetting industry
                  </div>
                  <div className="flex items-center justify-end space-x-1 mt-1">
                    <p className="text-xs">John Doe · 08:30AM</p>
                    <Avatar className="w-4 h-4">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-gradient-to-br from-purple-400 to-pink-500 text-white text-xs font-medium">
                        J
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              </div>
            </div>

            {/* Input Field */}
            <div className="p-4">
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2">
                  <input
                    type="text"
                    placeholder="Your Message..."
                    className="flex-1 bg-transparent text-sm border-none outline-none placeholder-gray-500"
                  />
                  <Paperclip className="w-4 h-4 text-gray-400 ml-2" />
                  <Smile className="w-4 h-4 text-gray-400 ml-2" />
                </div>
                <button
                  className="p-2 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="offline" className="mt-0 p-4">
          <div className="flex flex-col  gap-2">
            {/* Offline Header */}
            <div
              className="relative px-4 py-6 text-center rounded-2xl"
              style={{ backgroundColor: primaryColor }}
            >
              <h3
                className="font-medium text-white"
                style={{ color: widget_text_color }}
              >
                {offline_text}
              </h3>
              <div className="absolute top-0 left-0">
                <svg
                  width={455}
                  height={95}
                  viewBox="0 0 455 95"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <mask
                    id="mask0_201_2457"
                    style={{
                      maskType: "luminance",
                    }}
                    maskUnits="userSpaceOnUse"
                    x={-26}
                    y={-103}
                    width={484}
                    height={242}
                  >
                    <path d="M458 -103H-26V139H458V-103Z" fill="white" />
                  </mask>
                  <g mask="url(#mask0_201_2457)">
                    <path
                      opacity={0.1}
                      d="M-34.3301 146.831C-17.936 97.2259 2.87125 81.379 19.587 76.5615C47.7246 68.4522 66.7638 90.8747 91.1819 79.2132C119.5 65.689 109.05 28.2932 134.05 15.1314C169.485 -3.52394 215.128 58.6243 251.166 41.648C284.154 26.1083 268.591 -36.6511 299.779 -48.9505C330.239 -60.9625 360.228 -7.0736 400.543 -13.153C421.81 -16.3601 448.528 -36.6441 473.021 -110.823"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-27.7109 156.919C-11.3169 107.314 9.49039 91.4674 26.2062 86.6499C54.3438 78.5406 73.383 100.963 97.801 89.3016C126.119 75.7774 115.669 38.3817 140.67 25.2197C176.104 6.56431 221.747 68.7126 257.785 51.7364C290.773 36.1967 275.21 -26.5627 306.399 -38.8621C336.858 -50.8741 366.847 3.01478 407.162 -3.06463C428.429 -6.27173 455.147 -26.5557 479.641 -100.734"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-21.0918 167.007C-4.69775 117.402 16.1095 101.556 32.8253 96.7381C60.9628 88.6288 80.0021 111.051 104.42 99.3898C132.738 85.8657 122.288 48.47 147.289 35.308C182.723 16.6526 228.366 78.801 264.404 61.8247C297.392 46.285 281.829 -16.4744 313.018 -28.7739C343.478 -40.7859 373.466 13.103 413.781 7.02363C435.048 3.81653 461.767 -16.4676 486.26 -90.646"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-14.4707 177.098C1.92334 127.493 22.7306 111.646 39.4464 106.829C67.584 98.7193 86.6232 121.142 111.041 109.48C139.359 95.9561 128.909 58.5605 153.91 45.3984C189.345 26.743 234.987 88.8914 271.025 71.9151C304.013 56.3754 288.45 -6.38399 319.639 -18.6834C350.099 -30.6954 380.087 23.1935 420.402 17.1141C441.669 13.907 468.388 -6.37697 492.881 -80.5555"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-7.85156 187.184C8.54249 137.579 29.3498 121.732 46.0655 116.915C74.2031 108.805 93.2424 131.228 117.66 119.566C145.979 106.042 135.529 68.6466 160.529 55.4846C195.964 36.8292 241.606 98.9775 277.644 82.0013C310.632 66.4616 295.069 3.70219 326.258 -8.59722C356.718 -20.6093 386.707 33.2797 427.021 27.2003C448.288 23.9932 475.007 3.70908 499.5 -70.4694"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M-1.23242 197.272C15.1616 147.668 35.9689 131.821 52.6847 127.003C80.8223 118.894 99.8615 141.316 124.28 129.655C152.598 116.131 142.148 78.735 167.148 65.573C202.583 46.9177 248.226 109.066 284.263 92.0897C317.251 76.55 301.689 13.7906 332.877 1.49115C363.337 -10.5209 393.326 43.368 433.64 37.2886C454.907 34.0815 481.626 13.7976 506.119 -60.381"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M5.38672 207.36C21.7808 157.756 42.588 141.909 59.3038 137.091C87.4414 128.982 106.481 151.405 130.899 139.743C159.217 126.219 148.767 88.8231 173.767 75.6612C209.202 57.0058 254.845 119.154 290.882 102.178C323.87 86.6382 308.308 23.8788 339.496 11.5794C369.956 -0.432622 399.945 53.4563 440.259 47.3769C461.526 44.1698 488.245 23.8858 512.738 -50.2927"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M12.0078 217.451C28.4019 167.846 49.2091 151.999 65.9249 147.182C94.0625 139.073 113.102 161.495 137.52 149.834C165.838 136.309 155.388 98.9137 180.388 85.7517C215.823 67.0964 261.466 129.245 297.504 112.268C330.492 96.7287 314.929 33.9693 346.117 21.6699C376.577 9.65784 406.566 63.5468 446.881 57.4674C468.148 54.2603 494.866 33.9763 519.359 -40.2023"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M18.627 227.539C35.021 177.935 55.8283 162.088 72.5441 157.27C100.682 149.161 119.721 171.584 144.139 159.922C172.457 146.398 162.007 109.002 187.008 95.8401C222.442 77.1847 268.085 139.333 304.123 122.357C337.111 106.817 321.548 44.0577 352.736 31.7583C383.196 19.7462 413.185 73.6351 453.5 67.5557C474.767 64.3486 501.485 44.0647 525.978 -30.1139"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M25.2461 237.625C41.6401 188.021 62.4474 172.174 79.1633 167.356C107.301 159.247 126.34 181.67 150.758 170.008C179.076 156.484 168.626 119.088 193.627 105.926C229.062 87.271 274.704 149.419 310.742 132.443C343.73 116.903 328.167 54.1438 359.356 41.8444C389.816 29.8324 419.804 83.7213 460.119 77.6419C481.386 74.4348 508.105 54.1509 532.598 -20.0277"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M31.8652 247.714C48.2593 198.109 69.0666 182.262 85.7823 177.445C113.92 169.335 132.959 191.758 157.377 180.096C185.695 166.572 175.245 129.177 200.246 116.015C235.681 97.3591 281.323 159.507 317.361 142.531C350.349 126.992 334.786 64.2321 365.975 51.9327C396.435 39.9206 426.423 93.8096 466.738 87.7302C488.005 84.5231 514.724 64.2391 539.217 -9.93945"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M38.4863 257.802C54.8804 208.197 75.6877 192.351 92.4034 187.533C120.541 179.424 139.58 201.846 163.998 190.185C192.317 176.661 181.866 139.265 206.867 126.103C242.302 107.448 287.944 169.596 323.982 152.62C356.97 137.08 341.407 74.3205 372.596 62.0211C403.056 50.009 433.045 103.898 473.359 97.8186C494.626 94.6114 521.345 74.3275 545.838 0.148926"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M45.1055 267.893C61.4995 218.288 82.3068 202.441 99.0226 197.623C127.16 189.514 146.199 211.937 170.618 200.275C198.936 186.751 188.486 149.355 213.486 136.193C248.921 117.538 294.564 179.686 330.601 162.71C363.589 147.17 348.027 84.4109 379.215 72.1115C409.675 60.0995 439.664 113.988 479.978 107.909C501.245 104.702 527.964 84.4179 552.457 10.2394"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M51.7246 277.981C68.1187 228.376 88.9259 212.529 105.642 207.712C133.779 199.602 152.819 222.025 177.237 210.364C205.555 196.839 195.105 159.444 220.105 146.282C255.54 127.626 301.183 189.775 337.22 172.798C370.208 157.259 354.646 94.4993 385.834 82.1999C416.294 70.1879 446.283 124.077 486.598 117.997C507.864 114.79 534.583 94.5063 559.076 20.3278"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M58.3438 288.067C74.7378 238.462 95.5451 222.616 112.261 217.798C140.398 209.689 159.438 232.111 183.856 220.45C212.174 206.926 201.724 169.53 226.724 156.368C262.159 137.712 307.802 199.861 343.84 182.885C376.828 167.345 361.265 104.585 392.453 92.2861C422.913 80.274 452.902 134.163 493.217 128.084C514.484 124.876 541.202 104.593 565.695 30.4139"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M64.9629 298.155C81.3569 248.551 102.164 232.704 118.88 227.886C147.018 219.777 166.057 242.2 190.475 230.538C218.793 217.014 208.343 179.618 233.343 166.456C268.778 147.801 314.421 209.949 350.459 192.973C383.447 177.433 367.884 114.674 399.072 102.374C429.532 90.3623 459.521 144.251 499.836 138.172C521.103 134.965 547.821 114.681 572.314 40.5022"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M71.584 308.246C87.978 258.641 108.785 242.794 125.501 237.977C153.639 229.867 172.678 252.29 197.096 240.628C225.414 227.104 214.964 189.709 239.965 176.547C275.399 157.891 321.042 220.04 357.08 203.063C390.068 187.524 374.505 124.764 405.693 112.465C436.153 100.453 466.142 154.342 506.457 148.262C527.724 145.055 554.442 124.771 578.936 50.5927"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M78.2031 318.334C94.5972 268.73 115.404 252.883 132.12 248.065C160.258 239.956 179.297 262.378 203.715 250.717C232.033 237.193 221.583 199.797 246.584 186.635C282.018 167.98 327.661 230.128 363.699 213.152C396.687 197.612 381.124 134.853 412.313 122.553C442.772 110.541 472.761 164.43 513.076 158.351C534.343 155.144 561.062 134.859 585.555 60.681"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M84.8223 328.422C101.216 278.818 122.024 262.971 138.739 258.153C166.877 250.044 185.916 272.467 210.334 260.805C238.652 247.281 228.202 209.885 253.203 196.723C288.638 178.068 334.28 240.216 370.318 223.24C403.306 207.7 387.743 144.941 418.932 132.641C449.392 120.629 479.381 174.518 519.695 168.439C540.962 165.232 567.681 144.948 592.174 70.7693"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M91.4414 338.511C107.835 288.906 128.643 273.059 145.359 268.242C173.496 260.132 192.535 282.555 216.953 270.893C245.272 257.369 234.822 219.974 259.822 206.812C295.257 188.156 340.899 250.305 376.937 233.328C409.925 217.789 394.362 155.029 425.551 142.73C456.011 130.718 486 184.607 526.314 178.527C547.581 175.32 574.3 155.036 598.793 80.8577"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                    <path
                      opacity={0.1}
                      d="M98.0625 348.597C114.457 298.992 135.264 283.145 151.98 278.328C180.117 270.219 199.156 292.641 223.574 280.98C251.893 267.455 241.443 230.06 266.443 216.898C301.878 198.242 347.521 260.391 383.558 243.415C416.546 227.875 400.984 165.115 432.172 152.816C462.632 140.804 492.621 194.693 532.935 188.613C554.202 185.406 580.921 165.122 605.414 90.9438"
                      stroke="white"
                      strokeMiterlimit={10}
                    />
                  </g>
                </svg>
              </div>
            </div>

            {/* Offline Form */}
            <div
              className="flex-1 px-4 py-4 space-y-4 rounded-2xl"
              style={{ backgroundColor: secondaryColor + "10" }}
            >
              <div>
                <p className="text-sm text-gray-500">
                  Please leave a message and we will get back to you in a few
                  business hours.
                </p>
              </div>
              <div className="space-y-3 rounded-2xl">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Name"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email or Phone
                  </label>
                  <input
                    type="text"
                    placeholder="Enter email or phone"
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    placeholder="Type..."
                    rows={3}
                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-md text-sm placeholder-gray-500 resize-none"
                  />
                </div>

                <button
                  className="w-full py-2 rounded-md text-white font-medium text-sm"
                  style={{ backgroundColor: primaryColor }}
                >
                  Send
                </button>
              </div>
            </div>

            {/* Input Field */}
            <div className="p-4 border-t">
              <div className="flex items-center space-x-2">
                <div className="flex-1 flex items-center bg-gray-50 rounded-lg px-3 py-2">
                  <input
                    type="text"
                    placeholder="Your Message..."
                    className="flex-1 bg-transparent text-sm border-none outline-none placeholder-gray-500"
                  />
                  <Paperclip className="w-4 h-4 text-gray-400 ml-2" />
                  <Smile className="w-4 h-4 text-gray-400 ml-2" />
                </div>
                <button
                  className="p-2 rounded-lg text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>

    {/* Button Preview */}
    <div className="flex items-center justify-end mt-4">
      <Button className="rounded-full " style={{ backgroundColor: primaryColor }}>
        <MessageCircleMoreIcon className="" />
        {button_label}
      </Button>
    </div>

    </div>
   
  );
}

export default function NewWidgetPage() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [showPrimaryColorPicker, setShowPrimaryColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] =
    useState(false);
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);

  // Get departments for the form
  const { data: departments, isLoading: isLoadingDepartments } =
    useGetAllDepartments({
      enabled: currentUser?.role === "ADMIN",
    });

  const form = useForm<WidgetFormValues>({
    resolver: zodResolver(widgetFormSchema),
    defaultValues: {
      name: "",
      domains: [],
      departmentIds: [],
      isEnabled: true,
      primaryColor: THEME_PRESETS["Light blue"].primaryColor,
      secondaryColor: THEME_PRESETS["Light blue"].secondaryColor,
      themeName: "Light blue",
      welcomeMessage: "Welcome! How can we help you today?",
      headerText: "Customer Support",
      offline_text: "We are offline right now",
      notification_emails: [],
      button_location: "bottom_right",
      button_label: "Chat with us",
      widget_text_color: "#FFFFFF",
    },
  });

  // Prefill notification emails with the admin's email by default
  useEffect(() => {
    if (currentUser?.email) {
      const existing = form.getValues("notification_emails");
      if (!existing || existing.length === 0) {
        form.setValue("notification_emails", [currentUser.email], {
          shouldDirty: true,
        });
      }
    }
  }, [currentUser?.email]);

  const createWidgetMutation = useCreateWidgetMutation({
    onSuccess: () => {
      toast("Widget Created", {
        description: "The new widget has been successfully created.",
      });
      queryClient.invalidateQueries({ queryKey: [WIDGETS_QUERY_KEY] });
      router.push("/dashboard/widgets");
    },
    onError: (error) => {
      toast.error("Failed to create widget.", {
        description: error.message,
      });
    },
  });

  const handleFormSubmit = (values: WidgetFormValues) => {
    const { themeName, ...rest } = values;
    const theme = {
      name: themeName,
      primaryColor: values.primaryColor,
      secondaryColor: values.secondaryColor,
    } as const;

    const processedValues = {
      ...rest,
      theme,
      // Filter out empty strings from domains if any
      domains:
        values.domains
          ?.filter((domain) => domain.trim() !== "")
          .map((d) => d.trim()) || [],
      notification_emails:
        values.notification_emails
          ?.map((e) => e.trim())
          .filter((e) => e.length > 0) || [],
    };

    createWidgetMutation.mutate(processedValues as CreateWidgetDto);
  };

  if (currentUser?.role !== "ADMIN") {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to manage widgets.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-2 sm:p-4 lg:p-8 space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="size-6" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center">
            Create New Widget
          </h1>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Form */}
        <Card className="p-4 px-1 sm:px-4">
          <CardHeader>
            <CardTitle>Widget Configuration</CardTitle>
          </CardHeader>
          <CardContent className="p-4 px-2 sm:px-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleFormSubmit)}
                className="space-y-6"
              >
                {/* Widget Name */}
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Widget Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Main Support Chat"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Domains */}
                <FormField
                  name="domains"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <Globe className="mr-2 h-4 w-4" /> Allowed Domains
                        (optional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="example.com, anotherexample.net (comma-separated)"
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
                        Leave empty to allow on any domain. Enter domains
                        without http(s)://.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Departments */}
                <FormField
                  name="departmentIds"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Departments</FormLabel>
                      {isLoadingDepartments && (
                        <p className="text-sm text-muted-foreground">
                          Loading departments...
                        </p>
                      )}
                      {!isLoadingDepartments &&
                      departments &&
                      departments.length > 0 ? (
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
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          dept._id,
                                        ])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value) => value !== dept._id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {dept.name}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No departments available. Please create departments
                          first.
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Theme & Styling */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Theme Name */}
                  <FormField
                    name="themeName"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Theme</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={(val) => {
                              field.onChange(val);
                              if (val !== "Custom") {
                                const preset =
                                  THEME_PRESETS[
                                    val as keyof typeof THEME_PRESETS
                                  ];
                                form.setValue(
                                  "primaryColor",
                                  preset.primaryColor,
                                  { shouldDirty: true }
                                );
                                form.setValue(
                                  "secondaryColor",
                                  preset.secondaryColor,
                                  { shouldDirty: true }
                                );
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select theme" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Light blue">
                                Light blue
                              </SelectItem>
                              <SelectItem value="Sharp blue">
                                Sharp blue
                              </SelectItem>
                              <SelectItem value="Custom">Custom</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="primaryColor"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Palette className="mr-2 h-4 w-4" /> Primary Color
                        </FormLabel>
                        <FormControl>
                          <Popover
                            open={showPrimaryColorPicker}
                            onOpenChange={setShowPrimaryColorPicker}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start font-normal"
                              >
                                <div
                                  className="w-5 h-5 rounded-sm mr-2 border"
                                  style={{ backgroundColor: field.value }}
                                />
                                {field.value}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 border-0"
                              align="start"
                            >
                              <HexColorPicker
                                color={field.value}
                                onChange={(color) => {
                                  field.onChange(color);
                                  const matchesPreset = Object.entries(
                                    THEME_PRESETS
                                  ).find(
                                    ([name, preset]) =>
                                      preset.primaryColor.toLowerCase() ===
                                        color.toLowerCase() &&
                                      preset.secondaryColor.toLowerCase() ===
                                        form
                                          .getValues("secondaryColor")
                                          .toLowerCase()
                                  );
                                  if (!matchesPreset) {
                                    form.setValue("themeName", "Custom", {
                                      shouldDirty: true,
                                    });
                                  } else {
                                    form.setValue(
                                      "themeName",
                                      matchesPreset[0] as any,
                                      { shouldDirty: true }
                                    );
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="secondaryColor"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Palette className="mr-2 h-4 w-4" /> Secondary Color
                        </FormLabel>
                        <FormControl>
                          <Popover
                            open={showSecondaryColorPicker}
                            onOpenChange={setShowSecondaryColorPicker}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start font-normal"
                              >
                                <div
                                  className="w-5 h-5 rounded-sm mr-2 border"
                                  style={{ backgroundColor: field.value }}
                                />
                                {field.value}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 border-0"
                              align="start"
                            >
                              <HexColorPicker
                                color={field.value}
                                onChange={(color) => {
                                  field.onChange(color);
                                  const matchesPreset = Object.entries(
                                    THEME_PRESETS
                                  ).find(
                                    ([name, preset]) =>
                                      preset.secondaryColor.toLowerCase() ===
                                        color.toLowerCase() &&
                                      preset.primaryColor.toLowerCase() ===
                                        form
                                          .getValues("primaryColor")
                                          .toLowerCase()
                                  );
                                  if (!matchesPreset) {
                                    form.setValue("themeName", "Custom", {
                                      shouldDirty: true,
                                    });
                                  } else {
                                    form.setValue(
                                      "themeName",
                                      matchesPreset[0] as any,
                                      { shouldDirty: true }
                                    );
                                  }
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="isEnabled"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-auto">
                        <div className="space-y-0.5">
                          <FormLabel className="flex items-center">
                            <ShieldCheck className="mr-2 h-4 w-4" /> Enable
                            Widget
                          </FormLabel>
                          <FormDescription>
                            Allow this widget to be active on websites.
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

                {/* Button appearance and behavior */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    name="button_location"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Location</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select location" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="top_left">Top left</SelectItem>
                              <SelectItem value="top_right">
                                Top right
                              </SelectItem>
                              <SelectItem value="bottom_left">
                                Bottom left
                              </SelectItem>
                              <SelectItem value="bottom_right">
                                Bottom right
                              </SelectItem>
                              <SelectItem value="center_left">
                                Center left
                              </SelectItem>
                              <SelectItem value="center_right">
                                Center right
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="button_label"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Button Label</FormLabel>
                        <FormControl>
                          <Input placeholder="Chat with us" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  name="headerText"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Header Text</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Live Support" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="welcomeMessage"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        <MessageSquareText className="mr-2 h-4 w-4" /> Welcome
                        Message
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., Hello! How can we assist you today?"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  name="offline_text"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offline Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="We are offline right now. Please leave a message and we will get back to you in a few business hours."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    name="notification_emails"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notification Emails (optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="admin@example.com, support@example.com"
                            value={field.value?.join(", ")}
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? e.target.value
                                      .split(",")
                                      .map((d) => d.trim())
                                  : []
                              )
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="widget_text_color"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Palette className="mr-2 h-4 w-4" /> Widget Text Color
                        </FormLabel>
                        <FormControl>
                          <Popover
                            open={showTextColorPicker}
                            onOpenChange={setShowTextColorPicker}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className="w-full justify-start font-normal"
                              >
                                <div
                                  className="w-5 h-5 rounded-sm mr-2 border"
                                  style={{
                                    backgroundColor: field.value || "#FFFFFF",
                                  }}
                                />
                                {field.value}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 border-0"
                              align="start"
                            >
                              <HexColorPicker
                                color={field.value || "#FFFFFF"}
                                onChange={field.onChange}
                              />
                            </PopoverContent>
                          </Popover>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/dashboard/widgets")}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createWidgetMutation.isPending}
                  >
                    {createWidgetMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Widget"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Right Column - Preview */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle>Widget Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-0 md:p-6 ">
            <WidgetPreview form={form} />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
