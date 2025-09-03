"use client";

import { useState } from "react";
import { Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUnblockCustomerMutation } from "@/lib/blocked-customer.api";
import { BlockedCustomer } from "@/types/blocked-customer";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { BLOCKED_CUSTOMERS_QUERY_KEY } from "@/lib/blocked-customer.api";
import UnblockCustomerDialog from "./unblock-customer-dialog";

interface CellActionProps {
  data: BlockedCustomer;
}

export default function CellAction({ data }: CellActionProps) {
  const [isUnblockDialogOpen, setIsUnblockDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const unblockMutation = useUnblockCustomerMutation({
    onSuccess: () => {
      toast.success("Customer unblocked successfully");
      queryClient.invalidateQueries({ queryKey: [BLOCKED_CUSTOMERS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unblock customer");
    },
  });

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Unblock Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsUnblockDialogOpen(true)}
          className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Unlock className="h-4 w-4" />
          <span className="sr-only">Unblock</span>
        </Button>
      </div>

      {/* Unblock Dialog */}
      <UnblockCustomerDialog
        open={isUnblockDialogOpen}
        onOpenChange={setIsUnblockDialogOpen}
        blockedCustomer={data}
        onUnblock={() => {
          unblockMutation.mutate({ customerId: data._id });
          setIsUnblockDialogOpen(false);
        }}
        isLoading={unblockMutation.isPending}
      />
    </>
  );
}
