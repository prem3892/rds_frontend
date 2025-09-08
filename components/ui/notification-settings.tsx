// components/ui/notification-settings.tsx
"use client";

import React from "react";
import { Bell, BellOff, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/hooks/useNotifications";

interface NotificationSettingsProps {
  className?: string;
}

export function NotificationSettings({ className }: NotificationSettingsProps) {
  const {
    isSupported,
    permission,
    isPermissionGranted,
    requestPermission,
  } = useNotifications();

  const getPermissionStatus = () => {
    switch (permission) {
      case "granted":
        return {
          icon: CheckCircle,
          color: "bg-green-500",
          text: "Enabled",
          description: "You will receive push notifications for new messages and chat requests.",
        };
      case "denied":
        return {
          icon: XCircle,
          color: "bg-red-500",
          text: "Blocked",
          description: "Notifications are blocked. Please enable them in your browser settings.",
        };
      default:
        return {
          icon: AlertCircle,
          color: "bg-yellow-500",
          text: "Not Set",
          description: "Click the button below to enable notifications.",
        };
    }
  };

  const handleEnableNotifications = async () => {
    try {
      const result = await requestPermission();
      if (result === "granted") {
        console.log("Notifications enabled successfully");
      } else {
        console.log("Notifications permission denied");
      }
    } catch (error) {
      console.error("Failed to request notification permission:", error);
    }
  };

  if (!isSupported) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BellOff className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <CardDescription>
            Push notifications are not supported in this browser.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-sm text-muted-foreground">Not Supported</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const status = getPermissionStatus();
  const StatusIcon = status.icon;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Push Notifications</CardTitle>
          </div>
          <Badge 
            variant="secondary" 
            className={`${status.color} text-white`}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {status.text}
          </Badge>
        </div>
        <CardDescription>
          Get notified when you receive new messages or chat requests.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <StatusIcon className={`h-4 w-4 mt-0.5 ${
            permission === "granted" ? "text-green-500" :
            permission === "denied" ? "text-red-500" : "text-yellow-500"
          }`} />
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Status: {status.text}
            </p>
            <p className="text-sm text-muted-foreground">
              {status.description}
            </p>
          </div>
        </div>

        {permission === "default" && (
          <Button 
            onClick={handleEnableNotifications} 
            className="w-full"
            size="sm"
          >
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
        )}

        {permission === "denied" && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>To enable notifications:</strong>
            </p>
            <ol className="text-sm text-yellow-700 dark:text-yellow-300 mt-2 space-y-1 list-decimal list-inside">
              <li>Click the lock icon in your browser's address bar</li>
              <li>Set notifications to "Allow"</li>
              <li>Refresh this page</li>
            </ol>
          </div>
        )}

        {isPermissionGranted && (
          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                Notifications are enabled!
              </p>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-1">
              You'll receive push notifications for new messages and chat requests, 
              even when this tab is not active.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
