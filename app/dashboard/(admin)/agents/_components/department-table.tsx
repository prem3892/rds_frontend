"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Department } from "@/types";
import { AgentProfile } from "@/lib/agent.api";
import { Edit, Trash2, Users } from "lucide-react";

// Helper function to get the full image URL
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return undefined;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  return `${API_BASE_URL}${imagePath}`;
};

interface DepartmentTableProps {
  departments: Department[];
  agents: AgentProfile[];
  isLoading: boolean;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

export default function DepartmentTable({
  departments,
  agents,
  isLoading,
  onEdit,
  onDelete,
}: DepartmentTableProps) {
  // Helper function to get agents for a specific department
  const getAgentsForDepartment = (departmentId: string) => {
    return agents.filter(agent => agent.departmentIds.includes(departmentId));
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-4 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
          <p className="text-gray-500">Create your first department to get started.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {departments.map((department) => {
        const departmentAgents = getAgentsForDepartment(department._id);
        
        return (
          <Card key={department._id} className="shadow-sm border-gray-200">
            <CardContent className="p-6">
              {/* Header Row */}
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Department</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">User Name</span>
                </div>
                <div className="flex items-center space-x-2">
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

              {/* Department Content */}
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {department.name}
                  </h3>
                  {department.description && (
                    <p className="text-sm text-gray-500">{department.description}</p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex -space-x-2">
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
                    <Badge variant="outline" className="text-xs font-medium">
                      +{departmentAgents.length - 5} more
                    </Badge>
                  )}
                  {departmentAgents.length === 0 && (
                    <span className="text-sm text-gray-500 italic">No agents assigned</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
