import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, User } from "lucide-react";
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
  onBack?: () => void;
  onShowGuestInfo?: () => void;
}

const ChatHeader = ({ 
  session, 
  onResolve, 
  onEnd, 
  onBack,
  onShowGuestInfo 
}: ChatHeaderProps) => {
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
      <header className="bg-white rounded-t-3xl p-4">
        <div className="flex items-center justify-between">
          {/* Left side - Back button and guest info */}
          <div className="flex items-center gap-4">
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-9 w-9 flex-shrink-0">
                <AvatarImage src={undefined} />
                <AvatarFallback className="text-sm">{customerInitial}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-md leading-tight truncate">
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
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {onShowGuestInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowGuestInfo}
                className="text-xs hidden sm:flex"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Guest Info</span>
              </Button>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleBookClick}
              disabled={
                session.status !== "ACTIVE" ||
                session.appointmentBooked === true ||
                isBookingInProgress
              }
              className="text-xs"
            >
              {isBookingInProgress ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  <span className="hidden sm:inline">Booking...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  <span className="hidden sm:inline">
                    {session.appointmentBooked ? "Booked" : "Book Now"}
                  </span>
                </>
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onEnd(session._id)}
              disabled={session.status !== "ACTIVE"}
              className="text-xs"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">End Chat</span>
            </Button>
          </div>
        </div>

        {/* Care message */}
        <div className="mt-3 p-3 bg-gradient-to-r from-blue-100  to-transparent rounded-none">
          <p className="text-sm text-blue-800 font-medium">
            While chatting, let&apos;s show them care!
          </p>
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
