"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AGENTS_QUERY_KEY, AgentProfile, useGetAllAgents, useSetAgentStatusMutation } from "@/lib/agent.api";
import { useGetAllDepartments } from "@/lib/department.api";
import { cn } from "@/lib/utils";
import { useCurrentUser } from "@/stores/auth";
import { Department } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, Building2, PlusCircle, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  AgentTable,
  CreateAgentDialog,
  CreateDepartmentDialog,
  DeleteDepartmentDialog,
  DepartmentMobileCard,
  DepartmentSearchFilters,
  EditAgentForm,
  EditDepartmentForm,
  SearchFilters,
  createDepartmentColumns
} from "./_components";

interface AgentFilters {
  search: string;
  department: string;
  status: string;
}

interface DepartmentFilters {
  search: string;
}

export default function AgentsPage() {
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  
  // Agent states
  const [isCreateAgentDialogOpen, setIsCreateAgentDialogOpen] = useState(false);
  const [isEditAgentDialogOpen, setIsEditAgentDialogOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);
  const [agentFilters, setAgentFilters] = useState<AgentFilters>({
    search: "",
    department: "all",
    status: "all",
  });

  // Department states
  const [isCreateDepartmentDialogOpen, setIsCreateDepartmentDialogOpen] = useState(false);
  const [isEditDepartmentDialogOpen, setIsEditDepartmentDialogOpen] = useState(false);
  const [isDeleteDepartmentDialogOpen, setIsDeleteDepartmentDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [deletingDepartment, setDeletingDepartment] = useState<Department | null>(null);
  const [departmentFilters, setDepartmentFilters] = useState<DepartmentFilters>({
    search: "",
  });
  const [currentDepartmentPage, setCurrentDepartmentPage] = useState(1);
  const [departmentPageSize] = useState(10);

  const {
    data: agents,
    isLoading: isLoadingAgents,
    error: agentsError,
  } = useGetAllAgents({
    enabled: currentUser?.role === "ADMIN",
  });

  const { 
    data: departments, 
    isLoading: isLoadingDepartments 
  } = useGetAllDepartments({
    enabled: currentUser?.role === "ADMIN",
  });

  const setAgentStatusMutation = useSetAgentStatusMutation({
    onSuccess: () => {
      toast("Status Updated", {
        description: "Agent online status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: [AGENTS_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error("Status Update Failed", {
        description: error.message,
      });
    },
  });



  // Filter agents based on search and filters
  const filteredAgents = agents?.filter((agent) => {
    const matchesSearch = !agentFilters.search || 
      agent.user.firstName.toLowerCase().includes(agentFilters.search.toLowerCase()) ||
      agent.user.lastName.toLowerCase().includes(agentFilters.search.toLowerCase()) ||
      agent.user.email.toLowerCase().includes(agentFilters.search.toLowerCase());

    const matchesDepartment = !agentFilters.department || agentFilters.department === "all" || 
      agent.departmentIds.includes(agentFilters.department);

    const matchesStatus = !agentFilters.status || agentFilters.status === "all" || 
      (agentFilters.status === "online" && agent.isOnline) ||
      (agentFilters.status === "offline" && !agent.isOnline);

    return matchesSearch && matchesDepartment && matchesStatus;
  }) || [];

  // Filter departments based on search
  const filteredDepartments = departments?.filter((department) => {
    const matchesSearch = !departmentFilters.search || 
      department.name.toLowerCase().includes(departmentFilters.search.toLowerCase());
    return matchesSearch;
  }) || [];

  // Paginate departments
  const paginatedDepartments = filteredDepartments.slice(
    (currentDepartmentPage - 1) * departmentPageSize,
    currentDepartmentPage * departmentPageSize
  );

  const handleEditAgent = (agent: AgentProfile) => {
    setEditingAgent(agent);
    setIsEditAgentDialogOpen(true);
  };

  const handleToggleStatus = (agent: AgentProfile) => {
    setAgentStatusMutation.mutate({
      isOnline: !agent.isOnline,
    });
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsEditDepartmentDialogOpen(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setDeletingDepartment(department);
    setIsDeleteDepartmentDialogOpen(true);
  };

  const handleDepartmentPageChange = (page: number) => {
    setCurrentDepartmentPage(page);
  };

  // Reset department page when filters change
  useEffect(() => {
    setCurrentDepartmentPage(1);
  }, [departmentFilters.search]);

  if (currentUser?.role !== "ADMIN") {
    return (
      <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-4 md:p-6 lg:p-8 space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
    > 
    
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to manage agents and departments.
        </AlertDescription>
      </Alert>
    </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto p-2 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full"
    >
      <div className="bg-white rounded-3xl p-2 sm:p-4">
        <div className="flex justify-between items-center mx-2 sm:mx-4 mt-4 mb-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
              <span className="p-2 bg-blue-500 text-white mr-1 rounded-md">
                <Users className="text-2xl" />
              </span>
              Agents
            </h1>
          </div>
        </div>

        <Tabs defaultValue="agents" className="mx-2 sm:mx-4">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger 
              value="agents" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md transition-all text-xs sm:text-sm"
            >
              <Users className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="font-medium truncate">{agents?.length || 0} Agents</span>
            </TabsTrigger>
            <TabsTrigger 
              value="departments" 
              className="flex items-center space-x-1 sm:space-x-2 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm rounded-md transition-all text-xs sm:text-sm"
            >
              <Building2 className="h-4 w-4" />
              <span className="font-medium truncate">{departments?.length || 0} Departments</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="agents" className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center gap-2">
              <div className="flex-1">
                <SearchFilters
                  filters={agentFilters}
                  onFiltersChange={setAgentFilters}
                  departments={departments || []}
                />
              </div>
              <Button
                className="bg-[#1B76FF] hover:bg-blue-600"
                onClick={() => setIsCreateAgentDialogOpen(true)}
              >
                <PlusCircle className={cn("mr-2 h-4 w-4", "md:hidden size-6 md:mr-0")} /> 
                <span className="hidden md:block">Create New Agent</span>
              </Button>
            </div>

            <AgentTable
              agentData={filteredAgents}
              isLoadingAgents={isLoadingAgents}
              agentsError={agentsError || null}
              currentPage={1}
              onPageChange={() => {}}
              departments={departments || []}
              onEdit={handleEditAgent}
              onToggleStatus={handleToggleStatus}
            />
          </TabsContent>

          <TabsContent value="departments" className="space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <DepartmentSearchFilters
                  filters={departmentFilters}
                  onFiltersChange={setDepartmentFilters}
                />
              </div>
              <Button
                className="bg-[#1B76FF] hover:bg-blue-600"
                onClick={() => setIsCreateDepartmentDialogOpen(true)}
              >
                <PlusCircle className={cn("mr-2 h-4 w-4", "md:hidden size-6 md:mr-0")} /> 
                <span className="hidden md:block">Add Department</span>
              </Button>
            </div>

            <div className="bg-white p-2 sm:p-4 rounded-xl mt-4">
              {/* Mobile Card View */}
              <div className="block md:hidden">
                {isLoadingDepartments ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i} className="animate-pulse">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                                <div className="h-4 bg-gray-200 rounded w-48"></div>
                              </div>
                              <div className="flex gap-2">
                                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                              </div>
                            </div>
                            <div className="border-t border-gray-100 pt-3">
                              <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                              <div className="flex gap-2">
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {paginatedDepartments.map((department) => (
                      <DepartmentMobileCard
                        key={department._id}
                        department={department}
                        agents={agents || []}
                        onEdit={handleEditDepartment}
                        onDelete={handleDeleteDepartment}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <DataTable 
                  columns={createDepartmentColumns(agents || [], handleEditDepartment, handleDeleteDepartment)} 
                  data={paginatedDepartments} 
                  isLoading={isLoadingDepartments}
                  skeletonRows={8}
                />
              </div>
              
              {/* Pagination Controls */}
              {filteredDepartments.length > departmentPageSize && (
                <div className="mt-6">
                  <PaginationControls
                    currentPage={currentDepartmentPage}
                    totalPages={Math.ceil(filteredDepartments.length / departmentPageSize)}
                    onPageChange={handleDepartmentPageChange}
                  />
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Agent Dialog */}
      <CreateAgentDialog
        open={isCreateAgentDialogOpen}
        onOpenChange={setIsCreateAgentDialogOpen}
        departments={departments || []}
      />

      {/* Edit Agent Dialog */}
      <EditAgentForm
        open={isEditAgentDialogOpen}
        onOpenChange={setIsEditAgentDialogOpen}
        agent={editingAgent}
        departments={departments || []}
      />

      {/* Create Department Dialog */}
      <CreateDepartmentDialog
        open={isCreateDepartmentDialogOpen}
        onOpenChange={setIsCreateDepartmentDialogOpen}
      />

      {/* Edit Department Dialog */}
      <EditDepartmentForm
        open={isEditDepartmentDialogOpen}
        onOpenChange={setIsEditDepartmentDialogOpen}
        department={editingDepartment}
      />

      {/* Delete Department Dialog */}
      <DeleteDepartmentDialog
        open={isDeleteDepartmentDialogOpen}
        onOpenChange={setIsDeleteDepartmentDialogOpen}
        department={deletingDepartment}
      />
    </motion.div>
  );
}
