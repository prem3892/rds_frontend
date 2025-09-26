"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { ApiErrorResponse, Department } from "@/types";
import { AgentProfile, PaginatedAgentResponse } from "@/lib/agent.api";
import { Row } from "@tanstack/react-table";
import { Edit, Trash2, Shield, ShieldCheck, ToggleLeft } from "lucide-react";
import { createAgentColumns } from "./agent-columns";
import CellAction from "./cell-actions";
import { useState } from "react";
import { BlockAgentDialog } from "./block-agent-dialog";

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

type Props = {
  agentData: PaginatedAgentResponse | null;
  isLoadingAgents: boolean;
  agentsError: ApiErrorResponse | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  departments: Department[];
  onEdit: (agent: AgentProfile) => void;
  onToggleStatus: (agent: AgentProfile) => void;
  onBlockAgent: (agent: AgentProfile, isBlocked: boolean) => void;
  blockLoadingAgentId?: string | null;
  statusLoadingAgentId?: string | null;
};

// Agent Card Component for mobile view
const AgentCard = ({ 
  agent, 
  departments, 
  onEdit,
  onToggleStatus,
  onBlockAgent,
  blockLoadingAgentId,
  statusLoadingAgentId
}: { 
  agent: AgentProfile; 
  departments: Department[];
  onEdit: (agent: AgentProfile) => void;
  onToggleStatus: (agent: AgentProfile) => void;
  onBlockAgent: (agent: AgentProfile, isBlocked: boolean) => void;
  blockLoadingAgentId?: string | null;
  statusLoadingAgentId?: string | null;
}) => {
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
  // Process department names
  const departmentNames = agent.departmentIds.length > 0 ? (
    Array.isArray(agent.departmentIds) &&
    typeof agent.departmentIds[0] === "object" ? (
      // Handle case where departmentIds is an array of department objects
      agent.departmentIds.map((dept: any) => dept.name)
    ) : (
      // Handle case where departmentIds is an array of IDs
      departments
        ?.filter((dept: Department) =>
          agent.departmentIds.includes(dept._id)
        )
        .map((dept: Department) => dept.name) || []
    )
  ) : [];

  return (
    <Card className="mb-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          {/* Left side - Agent info */}
          <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
            {/* Avatar with online status */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                <AvatarImage
                  src={agent.profilePicture ? getFullImageUrl(agent.profilePicture) : undefined}
                  alt={`${agent.user.firstName} ${agent.user.lastName}`}
                />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-sm font-medium">
                  {agent.user.firstName?.[0] || ""}
                  {agent.user.lastName?.[0] || ""}
                </AvatarFallback>
              </Avatar>
              {/* Online Status Indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                <div
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${agent.isOnline ? "bg-green-500" : "bg-red-500"}`}
                />
              </div>
            </div>

            {/* Agent details */}
            <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
              {/* Name */}
              <h3 className="font-semibold text-gray-900 text-base sm:text-lg leading-tight">
                {agent.user.firstName} {agent.user.lastName}
              </h3>

              {/* Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-500 font-medium">Email:</span>
                <span className="text-xs sm:text-sm text-gray-700 break-all">{agent.user.email}</span>
              </div>

              {/* Departments as badges */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs sm:text-sm text-gray-500 font-medium flex-shrink-0">Departments:</span>
                <div className="flex flex-wrap gap-1">
                  {departmentNames.length > 0 ? (
                    departmentNames.map((deptName, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        {deptName}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline" className="text-xs text-gray-500">
                      None
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 pt-3 mt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(agent)}
              className="flex-1 h-8 text-xs"
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>
            <Button
              variant={agent.isOnline ? "destructive" : "default"}
              size="sm"
              onClick={() => onToggleStatus(agent)}
              disabled={isStatusLoading}
              className="flex-1 h-8 text-xs"
            >
              {isStatusLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  {agent.isOnline ? "Going Offline..." : "Going Online..."}
                </>
              ) : (
                <>
                  <ToggleLeft className="h-3 w-3 mr-1" />
                  {agent.isOnline ? "Go Offline" : "Go Online"}
                </>
              )}
            </Button>
            <Button
              variant={agent.isBlocked ? "default" : "destructive"}
              size="sm"
              onClick={handleBlockToggle}
              disabled={isBlockLoading}
              className="flex-1 h-8 text-xs"
            >
              {isBlockLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                  {agent.isBlocked ? "Unblocking..." : "Blocking..."}
                </>
              ) : (
                <>
                  {agent.isBlocked ? (
                    <ShieldCheck className="h-3 w-3 mr-1" />
                  ) : (
                    <Shield className="h-3 w-3 mr-1" />
                  )}
                  {agent.isBlocked ? "Unblock" : "Block"}
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      <BlockAgentDialog
        isOpen={showBlockDialog}
        onClose={() => setShowBlockDialog(false)}
        onConfirm={handleConfirmBlock}
        agent={agent}
        isLoading={isBlockLoading}
      />
    </Card>
  );
};

const AgentTable = (props: Props) => {
  const { 
    agentData, 
    isLoadingAgents, 
    agentsError, 
    currentPage,
    onPageChange,
    departments,
    onEdit,
    onToggleStatus,
    onBlockAgent,
    blockLoadingAgentId,
    statusLoadingAgentId
  } = props;
  
  const agents = agentData?.items || [];
  const meta = agentData?.meta;

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

  const columns = createAgentColumns({ departments, onEdit, onToggleStatus, onBlockAgent, blockLoadingAgentId, statusLoadingAgentId });

  return (
    <div className="bg-white p-2 sm:p-3 md:p-4 rounded-xl mt-3 sm:mt-4 overflow-hidden">
      {/* Mobile Card View */}
      <div className="block md:hidden">
        {isLoadingAgents ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse border border-gray-200">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                      {/* Avatar with status indicator */}
                      <div className="relative flex-shrink-0">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-200 rounded-full"></div>
                        <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm">
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-gray-200 rounded-full" />
                        </div>
                      </div>

                      {/* Agent details */}
                      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                        {/* Name */}
                        <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-40"></div>
                        
                        {/* Email */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className="h-4 bg-gray-200 rounded w-12"></div>
                          <div className="h-4 bg-gray-200 rounded w-40 sm:w-48"></div>
                        </div>

                        {/* Departments */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <div className="h-4 bg-gray-200 rounded w-20"></div>
                          <div className="flex flex-wrap gap-1">
                            <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                            <div className="h-5 bg-gray-200 rounded-full w-20"></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-100">
                      <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                      <div className="flex-1 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {agents.map((agent) => (
              <AgentCard 
                key={agent._id} 
                agent={agent} 
                departments={departments}
                onEdit={onEdit}
                onToggleStatus={onToggleStatus}
                onBlockAgent={onBlockAgent}
                blockLoadingAgentId={blockLoadingAgentId}
                statusLoadingAgentId={statusLoadingAgentId}
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

      {/* Pagination Controls */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-4 sm:mt-6 overflow-hidden">
          <PaginationControls
            currentPage={currentPage}
            totalPages={meta.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default AgentTable;
