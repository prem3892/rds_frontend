"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { AgentProfile } from "@/lib/agent.api";
import { Edit, ToggleLeft } from "lucide-react";
import { useState } from "react";
import { BlockAgentDialog } from "./block-agent-dialog";

interface CellActionProps {
  row: Row<AgentProfile>;
  onEdit: (agent: AgentProfile) => void;
  onToggleStatus: (agent: AgentProfile) => void;
  onBlockAgent: (agent: AgentProfile, isBlocked: boolean) => void;
  blockLoadingAgentId?: string | null;
  statusLoadingAgentId?: string | null;
}

const CellAction = ({ row, onEdit, onToggleStatus, onBlockAgent, blockLoadingAgentId, statusLoadingAgentId }: CellActionProps) => {
  const agent = row.original;
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const handleBlockToggle = () => {
    setShowBlockDialog(true);
  };

  const handleConfirmBlock = () => {
    onBlockAgent(agent, !agent.isBlocked);
    setShowBlockDialog(false);
  };

  const isStatusLoading = statusLoadingAgentId === agent._id;
  const isBlockLoading = blockLoadingAgentId === agent._id;

  return (
    <>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(agent)}
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant={agent.isOnline ? "destructive" : "default"}
          size="icon"
          onClick={() => onToggleStatus(agent)}
          disabled={isStatusLoading}
          className="h-8 w-8"
        >
          {isStatusLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <ToggleLeft className="h-4 w-4" />
          )}
        </Button>
        <div className="flex items-center space-x-2">
          <Switch
            checked={!agent.isBlocked}
            onCheckedChange={handleBlockToggle}
            disabled={isBlockLoading}
            className="data-[state=checked]:bg-green-500"
          />
          <span className="text-xs text-gray-500">
            {agent.isBlocked ? "Blocked" : "Active"}
          </span>
        </div>
      </div>
      
      <BlockAgentDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleConfirmBlock}
        agent={agent}
        isLoading={isBlockLoading}
      />
    </>
  );
};

export default CellAction;
