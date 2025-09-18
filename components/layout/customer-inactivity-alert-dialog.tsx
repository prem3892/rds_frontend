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
import { AlertTriangle, Clock } from "lucide-react";

interface CustomerInactivityAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
  customerName: string;
  chatSessionId: string;
}

export default function CustomerInactivityAlertDialog({
  open,
  onOpenChange,
  message,
  customerName,
  chatSessionId,
}: CustomerInactivityAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            Chat Session Ended
          </AlertDialogTitle>
          <AlertDialogDescription>
            The chat session has been closed due to customer inactivity.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>{customerName}:</strong> {message}
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
