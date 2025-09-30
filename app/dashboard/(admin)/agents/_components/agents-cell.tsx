"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { AgentProfile, Department } from "@/types";
import { useState } from "react";
import { AgentsModal } from "./agents-modal";

interface AgentsCellProps {
  department: Department;
  agents: AgentProfile[];
}

const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return undefined;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/";
  return `${API_BASE_URL}${imagePath}`;
};

export function AgentsCell({ department, agents }: AgentsCellProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const departmentAgents = agents.filter((agent) => {
    const ids = agent.departmentIds || [];
    return ids.some((dep) => {
      if (!dep) return false;
      if (typeof dep === "string") return dep === department._id;
      // handle object form: {_id: string} or full department objects
      // @ts-expect-error backend may return a populated object
      const maybeId = dep?._id ?? dep?.id;
      return maybeId === department._id;
    });
  });

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="flex -space-x-2">
          {departmentAgents.slice(0, 5).map((agent) => (
            <TooltipProvider key={agent._id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Avatar className="h-8 w-8 border-2 border-white rounded-full bg-gray-100 hover:z-10 transition-transform hover:scale-110">
                    <AvatarFallback className="text-xs bg-blue-100 text-blue-600 font-medium">
                      {agent.user.firstName[0]}{agent.user.lastName[0]}
                    </AvatarFallback>
                    <AvatarImage
                      src={agent.profilePicture ? getFullImageUrl(agent.profilePicture) : undefined}
                      alt={`${agent.user.firstName} ${agent.user.lastName}`}
                    />
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{agent.user.firstName} {agent.user.lastName}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
        {departmentAgents.length > 5 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs font-medium h-6 px-2 hover:bg-blue-50 hover:border-blue-200 cursor-pointer"
          >
            +{departmentAgents.length - 5} more
          </Button>
        )}
        {departmentAgents.length === 0 && (
          <span className="text-sm text-gray-500 italic">No agents assigned</span>
        )}
      </div>
      
      <AgentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departmentName={department.name}
        agents={departmentAgents}
      />
    </>
  );
}
