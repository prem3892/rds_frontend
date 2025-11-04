"use client";

import { Department, AgentProfile, DepartmentAgent } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Trash2, Users } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState } from "react";
import { AgentsModal } from "./agents-modal";

interface DepartmentMobileCardProps {
  department: Department;
  agents?: AgentProfile[]; // Made optional since we now use department.agents
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
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

export default function DepartmentMobileCard({
  department,
  agents,
  onEdit,
  onDelete,
}: DepartmentMobileCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use agents from department.agents if available, otherwise fall back to filtering from agents prop
  const departmentAgents = department.agents && department.agents.length > 0 
    ? department.agents.map((agent: DepartmentAgent) => ({
        _id: agent._id,
        user: {
          firstName: agent.firstName,
          lastName: agent.lastName,
        },
        profilePicture: agent.profilePicture,
        departmentIds: [department._id], // For compatibility with existing modal
      }))
    : agents?.filter((agent) => {
        const ids = agent.departmentIds || [];
        return ids.some((dep) => {
          if (!dep) return false;
          if (typeof dep === "string") return dep === department._id;
          // handle object form: {_id: string} or full department objects
          // @ts-expect-error backend may return a populated object
          const maybeId = dep?._id ?? dep?.id;
          return maybeId === department._id;
        });
      }) || [];

  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Department Header */}
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium text-gray-600">Department</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                {department.name}
              </h3>
              {department.description && (
                <p className="text-sm text-gray-500 mt-1">{department.description}</p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2 ml-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(department)}
                className="h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(department)}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Agents Section */}
          <div className="border-t border-gray-100 pt-3">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-600">User Name</span>
            </div>
            
            <div className="space-y-2">
              {departmentAgents.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {departmentAgents.slice(0, 5).map((agent) => (
                      <TooltipProvider key={agent._id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Avatar className="h-8 w-8 border-2 border-white rounded-full bg-gray-100 hover:z-10 transition-transform hover:scale-110">
                              <AvatarImage
                                src={agent.profilePicture ? getFullImageUrl(agent.profilePicture) : undefined}
                                alt={`${agent.user.firstName} ${agent.user.lastName}`}
                              />
                              <AvatarFallback className="text-xs bg-blue-100 text-blue-600 font-medium">
                                {agent.user.firstName[0]}{agent.user.lastName[0]}
                              </AvatarFallback>
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
                </>
              ) : (
                <span className="text-sm text-gray-500 italic">No agents assigned</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      
      <AgentsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        departmentName={department.name}
        agents={departmentAgents}
      />
    </Card>
  );
}
