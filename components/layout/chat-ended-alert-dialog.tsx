"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle, PhoneOff } from "lucide-react";

interface ChatEndedAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  customerName: string;
  chatSessionId: string;
}

export default function ChatEndedAlertDialog({
  open,
  onOpenChange,
  message,
  customerName,
  chatSessionId,
}: ChatEndedAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <PhoneOff className="h-5 w-5 text-red-600" />
            Chat Session Ended
          </AlertDialogTitle>
          <AlertDialogDescription>
            The chat session has been ended due to agent inactivity.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <strong>Customer:</strong> {customerName}
              <br />
              {message}
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <strong>Session ID:</strong> {chatSessionId}
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction className="w-full">
            OK
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
