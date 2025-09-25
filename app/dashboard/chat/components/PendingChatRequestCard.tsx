import React, { useState, useEffect } from "react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { ChatSession } from "@/types";

interface PendingChatRequestCardProps {
  session: ChatSession;
  onAccept: (sessionId: string) => void;
}

const PendingChatRequestCard = ({
  session,
  onAccept,
}: PendingChatRequestCardProps) => {
  const [elapsedTime, setElapsedTime] = useState("00:00:00");

  const getCustomerDisplay = () => {
  
      return session.customerId?.email || session.customerId?.name || session.customerId._id.slice(-6);
    
    
  };

  const getDepartmentDisplay = () => {
    return session.departmentId?.name ||
      (typeof session.departmentId === "object" && session.departmentId?.name) ||
     
      "N/A";
  };

  // Update timer every second
  useEffect(() => {
    const updateTimer = () => {
      const startTime = new Date(session.createdAt).getTime();
      const currentTime = new Date().getTime();
      const elapsed = currentTime - startTime;
      
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
      
      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      setElapsedTime(formattedTime);
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [session.createdAt]);

  const isPriorityChat = session.priorityNotificationSentCount > 0;

  return (
    <div
      className={`mb-2 p-3 hover:shadow-md transition-shadow cursor-pointer border rounded-lg relative ${
        isPriorityChat 
          ? "border-red-300 bg-red-50 hover:bg-red-100" 
          : "border-green-200 bg-white"
      }`}
      onClick={() => onAccept(session._id)}
    >
      <div className="flex justify-between w-full items-start mb-2">
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            {getCustomerDisplay()}
          </div>
          <div className="text-xs text-gray-600 mb-1">
            At : {session.domain.split("?")[0]}
          </div>
          <div className="text-xs text-gray-600">
            {formatDistanceToNowStrict(parseISO(session.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1 ml-2">
          {isPriorityChat && (
            <Badge className="bg-red-500 text-white text-xs px-2 py-1 rounded-md">
              PRIORITY
            </Badge>
          )}
          <Badge className={`text-white text-xs px-2 py-1 rounded-md ${
            isPriorityChat ? "bg-orange-500" : "bg-green-500"
          }`}>
            NEW
          </Badge>
        </div>
      </div>
      
      {/* Continuous Timer in bottom right */}
      <div className=" flex items-center justify-end">
        <span className={`text-xs font-mono px-2 py-1 rounded ${
          isPriorityChat 
            ? "text-red-600 bg-red-100 border border-red-200" 
            : "text-gray-500 bg-gray-100"
        }`}>
          {elapsedTime}
        </span>
      </div>
    </div>
  );
};

export default PendingChatRequestCard;
