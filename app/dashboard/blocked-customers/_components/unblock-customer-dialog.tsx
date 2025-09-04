"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BlockedCustomer } from "@/types/blocked-customer";
import { ShieldX, Unlock, AlertTriangle } from "lucide-react";

interface UnblockCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blockedCustomer: BlockedCustomer;
  onUnblock: () => void;
  isLoading: boolean;
}

export default function UnblockCustomerDialog({
  open,
  onOpenChange,
  blockedCustomer,
  onUnblock,
  isLoading,
}: UnblockCustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="h-5 w-5 text-green-600" />
            Unblock Customer
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to unblock this customer? They will be able to access the chat widget again.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <ShieldX className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <div className="font-medium text-sm">
                Customer ID: {blockedCustomer.fingerprint.substring(0, 20)}...
              </div>
              <div className="text-xs text-gray-500">
                Widget: {blockedCustomer.widgetId.name}
              </div>
              <div className="text-xs text-gray-500">
                Blocked on: {new Date(blockedCustomer.blockedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> This action cannot be undone. The customer will immediately regain access to the chat widget.
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={onUnblock}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Unblocking...
              </>
            ) : (
              <>
                <Unlock className="h-4 w-4 mr-2" />
                Unblock Customer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
