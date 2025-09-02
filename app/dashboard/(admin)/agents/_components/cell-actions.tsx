"use client";

import { Row } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { AgentProfile } from "@/lib/agent.api";
import { Edit, ToggleLeft } from "lucide-react";

interface CellActionProps {
  row: Row<AgentProfile>;
  onEdit: (agent: AgentProfile) => void;
  onToggleStatus: (agent: AgentProfile) => void;
}

const CellAction = ({ row, onEdit, onToggleStatus }: CellActionProps) => {
  const agent = row.original;

  return (
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
        className="h-8 w-8"
      >
        <ToggleLeft className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default CellAction;
