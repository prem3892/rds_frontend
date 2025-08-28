import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { ChatSession } from "@/types";
import { useIsBookingInProgress, useChatActions } from "@/stores/chat";
import BookingForm from "./BookingForm";

interface ChatHeaderProps {
  session: ChatSession;
  onResolve: (payload: {
    chatSessionId: string;
    date: string;
    notes?: string;
  }) => void;
  onEnd: (sessionId: string) => void;
}

const ChatHeader = ({ session, onResolve, onEnd }: ChatHeaderProps) => {
  const isBookingInProgress = useIsBookingInProgress(session._id);
  const chatActions = useChatActions();
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);

  const customerName =
    typeof session.customerId === "object"
      ? session.customerId?.firstName ||
        session.customerId?.email ||
        session.customerId._id.slice(-6)
      : session.customerId.slice(-6);

  const customerInitial =
    typeof session.customerId === "object"
      ? session.customerId?.firstName?.charAt(0)?.toUpperCase() ||
        session.customerId?.email?.charAt(0)?.toUpperCase() ||
        "C"
      : "C";

  const handleBookClick = useCallback(() => {
    setIsBookingFormOpen(true);
  }, []);

  const handleBookingFormClose = useCallback(() => {
    setIsBookingFormOpen(false);
  }, []);

  const handleBookingSubmit = useCallback(
    (bookingData: { date: string; notes?: string }) => {
      chatActions.setAppointmentBookingInProgress(session._id, true);
      onResolve({
        chatSessionId: session._id,
        date: bookingData.date,
        notes: bookingData.notes,
      });
      setIsBookingFormOpen(false);
    },
    [session._id, onResolve, chatActions]
  );

  return (
    <>
      <header className=" flex justify-between items-center shadow-sm">
        <div className="flex items-center">
          <Avatar className="h-9 w-9 mr-3">
            <AvatarImage src={undefined} />
            <AvatarFallback>{customerInitial}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-md leading-tight">
              {customerName}
            </h3>
            <Badge
              variant={session.status === "ACTIVE" ? "default" : "outline"}
              className="text-xs py-0 px-1.5 h-5"
            >
              {session.status.replace(/_/g, " ")}
            </Badge>
          </div>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBookClick}
            disabled={
              session.status !== "ACTIVE" ||
              session.appointmentBooked === true ||
              isBookingInProgress
            }
          >
            {isBookingInProgress ? (
              <>
                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                Booking...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                {session.appointmentBooked ? "Booked" : "Book"}
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onEnd(session._id)}
            disabled={session.status !== "ACTIVE"}
          >
            <XCircle className="h-4 w-4 mr-1.5" /> End Chat
          </Button>
        </div>
      </header>

      <BookingForm
        isOpen={isBookingFormOpen}
        onClose={handleBookingFormClose}
        onSubmit={handleBookingSubmit}
        chatSessionId={session._id}
        isLoading={isBookingInProgress}
      />
    </>
  );
};

export default ChatHeader;
