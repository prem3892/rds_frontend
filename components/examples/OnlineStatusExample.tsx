// components/examples/OnlineStatusExample.tsx
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * Example component demonstrating the useOnlineStatus hook
 * This shows how the online status persists across page refreshes
 * and synchronizes across different devices
 */
export function OnlineStatusExample() {
  const { isOnline, setOnlineStatus, toggleOnlineStatus } = useOnlineStatus();

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Online Status Management</h3>
      
      <div className="flex items-center gap-2">
        <span>Current Status:</span>
        <Badge variant={isOnline ? "default" : "secondary"}>
          {isOnline ? "Online" : "Offline"}
        </Badge>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => setOnlineStatus(true)}
          variant={isOnline ? "default" : "outline"}
          size="sm"
        >
          Go Online
        </Button>
        <Button
          onClick={() => setOnlineStatus(false)}
          variant={!isOnline ? "default" : "outline"}
          size="sm"
        >
          Go Offline
        </Button>
        <Button
          onClick={toggleOnlineStatus}
          variant="outline"
          size="sm"
        >
          Toggle Status
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <p>• Status is persisted in localStorage</p>
        <p>• Changes sync across all devices</p>
        <p>• Status restores on page refresh</p>
      </div>
    </div>
  );
}
