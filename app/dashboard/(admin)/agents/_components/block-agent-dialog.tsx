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
import { AlertCircle } from "lucide-react";
import { AgentProfile } from "@/lib/agent.api";

interface BlockAgentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  agent: AgentProfile | null;
  isLoading?: boolean;
}

export const BlockAgentDialog = ({
  isOpen,
  onClose,
  onConfirm,
  agent,
  isLoading = false,
}: BlockAgentDialogProps) => {
  if (!agent) return null;

  const isCurrentlyBlocked = agent.isBlocked;
  const action = isCurrentlyBlocked ? "unblock" : "block";
  const actionCapitalized = isCurrentlyBlocked ? "Unblock" : "Block";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <DialogTitle>
              {actionCapitalized} Agent
            </DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Are you sure you want to {action}{" "}
            <span className="font-semibold">
              {agent.user.firstName} {agent.user.lastName}
            </span>
            ?
            {!isCurrentlyBlocked && (
              <span className="block mt-2 text-amber-600">
                Blocking this agent will prevent them from logging in and accessing the system.
              </span>
            )}
            {isCurrentlyBlocked && (
              <span className="block mt-2 text-green-600">
                Unblocking this agent will allow them to login and access the system again.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={isCurrentlyBlocked ? "default" : "destructive"}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                {actionCapitalized}ing...
              </>
            ) : (
              actionCapitalized
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
