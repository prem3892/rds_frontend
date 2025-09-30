import React, { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useGetMyAgentProfile } from "@/lib/agent.api";

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: { date: string; notes?: string }) => void;
  chatSessionId: string;
  isLoading?: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  chatSessionId,
  isLoading = false,
}) => {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("10:00");
  const [notes, setNotes] = useState<string>("");

  // Get agent profile to access timezone information
  const { data: agentProfile } = useGetMyAgentProfile();

  const handleSubmit = () => {
    if (!date) return;

    // Get agent's timezone or default to UTC
    const agentTimezone = agentProfile?.timezone || 'UTC';

    // Combine date and time into a single Date object
    const [hours, minutes] = time.split(":").map(Number);
    const combinedDateTime = new Date(date);
    combinedDateTime.setHours(hours, minutes, 0, 0);

    // Create a date string that represents the local time in the agent's timezone
    // We'll format it as a local datetime string without timezone info
    // The backend should interpret this in the agent's timezone context
    const year = combinedDateTime.getFullYear();
    const month = String(combinedDateTime.getMonth() + 1).padStart(2, '0');
    const day = String(combinedDateTime.getDate()).padStart(2, '0');
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;
    
    // Create ISO string without timezone info - this represents the local time in agent's timezone
    const formattedDate = `${year}-${month}-${day}T${timeString}`;

    onSubmit({
      date: formattedDate,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book Appointment</DialogTitle>
          {agentProfile?.timezone && (
            <p className="text-sm text-muted-foreground">
              Times are in your timezone: <span className="font-medium">{agentProfile.timezone}</span>
            </p>
          )}
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex gap-4">
            <div className="flex-1 grid gap-2">
              <Label htmlFor="date" className="text-left">
                Appointment Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    disabled={(date) => {
                      // Disable dates before today in the agent's timezone
                      const today = new Date();
                      const todayInAgentTz = new Date(today.toLocaleString("en-US", { timeZone: agentProfile?.timezone || 'UTC' }));
                      const dateInAgentTz = new Date(date.toLocaleString("en-US", { timeZone: agentProfile?.timezone || 'UTC' }));
                      return dateInAgentTz < todayInAgentTz;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-1/3 grid gap-2">
              <Label htmlFor="time" className="text-left">
                Time
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-left">
              Additional Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or information for this appointment"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!date || isLoading}
            className={isLoading ? "opacity-80" : ""}
          >
            {isLoading ? "Booking..." : "Book Appointment"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BookingForm;
