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

  return (
    <div
      className="mb-2 p-3 hover:shadow-md transition-shadow cursor-pointer border border-green-200 rounded-lg bg-white relative"
      onClick={() => onAccept(session._id)}
    >
      <div className="flex justify-between w-full items-start mb-2">
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900 mb-1">
            {getCustomerDisplay()}
          </div>
          <div className="text-xs text-gray-600 mb-1">
            Dept: {getDepartmentDisplay()}
          </div>
          <div className="text-xs text-gray-600">
            {formatDistanceToNowStrict(parseISO(session.createdAt), {
              addSuffix: true,
            })}
          </div>
        </div>
        <Badge className="bg-green-500 text-white text-xs px-2 py-1 rounded-md ml-2">
          NEW
        </Badge>
      </div>
      
      {/* Continuous Timer in bottom right */}
      <div className="absolute bottom-2 right-2">
        <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">
          {elapsedTime}
        </div>
      </div>
    </div>
  );
};

export default PendingChatRequestCard;
