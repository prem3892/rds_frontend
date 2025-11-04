// Mobile Online/Offline switch (shows on small screens only)
import { Switch } from "@/components/ui/switch"
import { Loader2 } from 'lucide-react'

export function MobileStatusSwitch({
  isOnline,
  isStatusLoading,
  handleStatusChange,
}: {
  isOnline: boolean
  isStatusLoading: boolean
  handleStatusChange: (next: boolean) => void
}) {
  return (
    <div className="sm:hidden">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground" aria-hidden="true">
          {isOnline ? "Online" : "Offline"}
        </span>

        <Switch
          checked={isOnline}
          onCheckedChange={(checked) => {
            if (!isStatusLoading) handleStatusChange(checked)
          }}
          disabled={isStatusLoading}
          aria-label={isOnline ? "Go offline" : "Go online"}
          aria-busy={isStatusLoading || undefined}
        />

        {isStatusLoading && (
          <Loader2
            className="h-4 w-4 animate-spin text-muted-foreground"
            aria-hidden="true"
          />
        )}
        <span className="sr-only" aria-live="polite">
          {isStatusLoading ? "Updating status…" : `Status is ${isOnline ? "online" : "offline"}`}
        </span>
      </div>
    </div>
  )
}