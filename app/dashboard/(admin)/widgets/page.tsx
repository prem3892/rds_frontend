"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/stores/auth";
import { motion } from "framer-motion";
import { AlertTriangle, Globe, PlusCircle, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import WidgetTable from "./_components/widget-table";
import { useGetAllWidgets } from "@/lib/widget.api";
import { cn } from "@/lib/utils";

export default function WidgetsPage() {
  const currentUser = useCurrentUser();
  const router = useRouter();

  const {
    data: widgets,
    isLoading: isLoadingWidgets,
    error: widgetsError,
  } = useGetAllWidgets({
    enabled: currentUser?.role === "ADMIN",
  });

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
            <span>{widgets?.length}{" "} </span>Widgets
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
        widgets={widgets || []}
        isLoadingWidgets={isLoadingWidgets}
        widgetsError={widgetsError || null}
      />
    </div>
    </motion.div>
  );
}
