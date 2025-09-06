"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { AgentProfile, ApiErrorResponse, Department } from "@/types";
import { Row } from "@tanstack/react-table";
import {
  Building,
  Globe,
  Mail,
  MessageSquare,
  User
} from "lucide-react";
import { createAgentColumns } from "./agent-columns";
import CellAction from "./cell-actions";

// Helper function to get the full image URL
const getFullImageUrl = (imagePath: string) => {
  if (!imagePath) return null;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, prepend the API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
  return `${API_BASE_URL}${imagePath}`;
};

type Props = {
  agentData: AgentProfile[] | null;
  isLoadingAgents: boolean;
  agentsError: ApiErrorResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  departments: Department[];
  onEdit: (agent: AgentProfile) => void;
  onToggleStatus: (agent: AgentProfile) => void;
};

// Agent Card Component for mobile view
const AgentCard = ({ 
  agent, 
  departments, 
  onEdit, 
  onToggleStatus 
}: { 
  agent: AgentProfile; 
  departments: Department[];
  onEdit: (agent: AgentProfile) => void;
  onToggleStatus: (agent: AgentProfile) => void;
}) => {
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-3">
            {/* Agent Name */}
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage 
                  src={agent.profilePicture ? getFullImageUrl(agent.profilePicture) : undefined} 
                  alt={`${agent.user.firstName} ${agent.user.lastName}`} 
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                  {agent.user.firstName[0]}{agent.user.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <span className="font-semibold text-sm text-gray-900">
                {agent.user.firstName} {agent.user.lastName}
              </span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2">
              <Mail className="size-4 text-gray-500 flex-shrink-0" />
              <span className="text-sm text-gray-700">{agent.user.email}</span>
            </div>

            {/* Departments */}
            <div className="flex items-start gap-2">
              <Building className="size-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Departments
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.departmentIds.length > 0 ? (
                    Array.isArray(agent.departmentIds) &&
                    typeof agent.departmentIds[0] === "object" ? (
                      // Handle case where departmentIds is an array of department objects
                      agent.departmentIds.map((dept: any) => (
                        <Badge key={dept._id} variant="outline" className="text-xs">
                          {dept.name}
                        </Badge>
                      ))
                    ) : (
                      // Handle case where departmentIds is an array of IDs
                      departments
                        ?.filter((dept: Department) =>
                          agent.departmentIds.includes(dept._id)
                        )
                        .map((dept: Department) => (
                          <Badge key={dept._id} variant="outline" className="text-xs">
                            {dept.name}
                          </Badge>
                        ))
                    )
                  ) : (
                    <span className="text-sm text-gray-500">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Domain Access */}
            <div className="flex items-start gap-2">
              <Globe className="size-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-gray-500 uppercase tracking-wide">
                  Domain Access
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {agent.domainAccess && agent.domainAccess.length > 0 ? (
                    agent.domainAccess.map((domain, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {domain}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">All domains</span>
                  )}
                </div>
              </div>
            </div>

            {/* Status and Max Chats */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Badge
                  variant={agent.isOnline ? "default" : "secondary"}
                  className="text-xs"
                >
                  {agent.isOnline ? "Online" : "Offline"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-gray-500" />
                <Badge variant="outline" className="text-xs">
                  Max {agent.maxConcurrentChats} chats
                </Badge>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="ml-3 flex-shrink-0">
            <CellAction 
              row={{ original: agent } as Row<AgentProfile>} 
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AgentTable = (props: Props) => {
  const { 
    agentData, 
    isLoadingAgents, 
    agentsError, 
    departments,
    onEdit,
    onToggleStatus
  } = props;
  
  const agents = agentData || [];

  if (agentsError) {
    return (
      <div className="bg-white p-4 rounded-xl">
        <div className="text-center text-red-600 py-8">
          Error: {agentsError.message}
        </div>
      </div>
    );
  }

  if (!agents.length && !isLoadingAgents) {
    return (
      <div className="bg-white p-4 rounded-xl">
        <div className="text-center text-gray-500 py-8">
          No agents found
        </div>
      </div>
    );
  }

  const columns = createAgentColumns({ departments, onEdit, onToggleStatus });

  return (
    <div className="bg-white p-2 sm:p-3 md:p-4 rounded-xl mt-3 sm:mt-4 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {isLoadingAgents ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-3">
                      {/* Agent Name */}
                      <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                      </div>

                      {/* Email */}
                      <div className="flex items-center gap-2">
                        <div className="size-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                      </div>

                      {/* Departments */}
                      <div className="flex items-start gap-2">
                        <div className="size-4 bg-gray-200 rounded mt-0.5"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-20"></div>
                          <div className="flex gap-1">
                            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                          </div>
                        </div>
                      </div>

                      {/* Domain Access */}
                      <div className="flex items-start gap-2">
                        <div className="size-4 bg-gray-200 rounded mt-0.5"></div>
                        <div className="flex-1 space-y-1">
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                          <div className="flex gap-1">
                            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                          </div>
                        </div>
                      </div>

                      {/* Status and Max Chats */}
                      <div className="flex items-center gap-4">
                        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                        <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="ml-3">
                      <div className="flex gap-2">
                        <div className="size-8 bg-gray-200 rounded"></div>
                        <div className="size-8 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {agents.map((agent) => (
              <AgentCard 
                key={agent._id} 
                agent={agent} 
                departments={departments}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <DataTable 
          columns={columns} 
          data={agents || []} 
          isLoading={isLoadingAgents}
          skeletonRows={8}
        />
      </div>
    </div>
  );
};

export default AgentTable;
