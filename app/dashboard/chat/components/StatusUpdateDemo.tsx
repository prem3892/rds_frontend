import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ChatStatusIndicator from "./ChatStatusIndicator";
import ChatStatusBanner from "./ChatStatusBanner";
import { ChatSessionStatus } from "@/types";

/**
 * Demo component to showcase real-time status updates
 * This shows how the status indicators and banners work
 */
const StatusUpdateDemo = () => {
  const [currentStatus, setCurrentStatus] = useState<ChatSessionStatus>("ACTIVE");
  const [showBanner, setShowBanner] = useState(false);

  const statuses: ChatSessionStatus[] = [
    "ACTIVE",
    "PENDING_ASSIGNMENT", 
    "PENDING_AGENT_RECONNECT",
    "ABANDONED_BY_AGENT",
    "ABANDONED_BY_CUSTOMER",
    "CLOSED_BY_AGENT",
    "CLOSED_BY_CUSTOMER",
    "RESOLVED",
    "OFFLINE_MESSAGE"
  ];

  const cycleStatus = () => {
    const currentIndex = statuses.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statuses.length;
    setCurrentStatus(statuses[nextIndex]);
    setShowBanner(true);
    
    // Hide banner after 3 seconds
    setTimeout(() => setShowBanner(false), 3000);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Real-time Status Demo</CardTitle>
        <CardDescription>
          Click the button to cycle through different chat statuses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Status Indicator:</h4>
          <ChatStatusIndicator status={currentStatus} />
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Status Banner:</h4>
          {showBanner && (
            <ChatStatusBanner 
              status={currentStatus}
              customerName="Demo Customer"
            />
          )}
        </div>

        <Button onClick={cycleStatus} className="w-full">
          Cycle Status
        </Button>

        <div className="text-xs text-gray-500">
          Current: {currentStatus}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusUpdateDemo;
