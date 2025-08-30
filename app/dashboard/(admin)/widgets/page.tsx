"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useGetAllWidgets } from "@/lib/widget.api";
import { useCurrentUser } from "@/stores/auth";
import { motion } from "framer-motion";
import { AlertTriangle, Globe, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import WidgetTable from "./_components/widget-table";

export default function WidgetsPage() {
  const currentUser = useCurrentUser();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const {
    data: widgetData,
    isLoading: isLoadingWidgets,
    error: widgetsError,
  } = useGetAllWidgets(currentPage, pageSize, {
    enabled: currentUser?.role === "ADMIN",
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (currentUser?.role !== "ADMIN") {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You do not have permission to manage widgets.
        </AlertDescription>
      </Alert>
    );
  }

  return (

    <motion.div initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="mx-auto p-4 md:p-6 lg:p-8 space-y-6 bg-[#f2f4f8] rounded-3xl min-h-full">
    <div

      className="bg-white rounded-3xl p-4 "
    >
      <div className="flex justify-between items-center mx-4 mt-4">
        <div className="flex items-center space-x-2 ">
          <h1 className="text-2xl md:text-3xl font-semibold flex items-center">
            <span className="p-2 bg-blue-500  text-white mr-1 rounded-md ">
              <Globe className=" text-2xl" />
            </span>
            Widgets
          </h1>
        </div>
        <Button
          className="bg-[#1B76FF] hover:bg-blue-600"
          onClick={() => router.push("/dashboard/widgets/new")}
        >
          <PlusCircle className={cn("mr-2 h-4 w-4", "md:hidden size-6 md:mr-0")} /> 
          <span className="hidden md:block">Create New Widget</span>
        </Button>
      </div>

      <WidgetTable
        widgetData={widgetData || null}
        isLoadingWidgets={isLoadingWidgets}
        widgetsError={widgetsError || null}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
    </motion.div>
  );
}
