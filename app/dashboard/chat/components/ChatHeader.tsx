import React, { useState, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2, ArrowLeft, User, ShieldX, Calendar, Mail, Globe, MapPin } from "lucide-react";
import { ChatSession } from "@/types";
import { useIsBookingInProgress, useChatActions } from "@/stores/chat";
import BookingForm from "./BookingForm";
import ChatStatusIndicator from "./ChatStatusIndicator";
import { cn, getColorFromString } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { formatAppointmentDate } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

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
  onBlockCustomer?: (sessionId: string) => void;
  onRequestCustomerInfo?: (chatSessionId: string) => Promise<boolean>;
}

const ChatHeader = ({ 
  session, 
  onResolve, 
  onEnd, 
  onBack,
  onShowGuestInfo,
  onBlockCustomer,
  onRequestCustomerInfo
}: ChatHeaderProps) => {
  const isBookingInProgress = useIsBookingInProgress(session._id);
  const chatActions = useChatActions();
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [isRequestingEmail, setIsRequestingEmail] = useState(false);

  const customerName =

       session.customerId?.name ||
        session.customerId?.email ||
        `Guest-${session.customerId?._id.slice(-6)}`
   

  const customerInitial =
    typeof session.customerId === "object"
      ? session.customerId?.name?.charAt(0)?.toUpperCase() ||
        session.customerId?.email?.charAt(0)?.toUpperCase() ||
        "G"
      : "G";

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

  const handleRequestEmail = useCallback(async () => {
    if (!onRequestCustomerInfo || isRequestingEmail) return;

    setIsRequestingEmail(true);
    try {
      const success = await onRequestCustomerInfo(session._id);
      if (success) {
        toast.success("Email request sent to customer", {
          description: "The customer will be prompted to provide their email address.",
        });
      } else {
        toast.error("Failed to send email request", {
          description: "Please try again or check your connection.",
        });
      }
    } catch (error) {
      console.error("Error requesting customer email:", error);
      toast.error("Failed to send email request", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsRequestingEmail(false);
    }
  }, [onRequestCustomerInfo, session._id, isRequestingEmail]);

  return (
    <>
      <header className="bg-white rounded-t-3xl p-4">
        <div className="flex items-start justify-between gap-2 flex-col md:flex-row md:justify-between md:items-center">
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
                <AvatarFallback className={cn(
                  "text-sm text-white font-medium",
                  getColorFromString(customerName)
                )}>
                  {customerInitial}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h3 className="font-semibold text-md leading-tight truncate">
                  {customerName}
                </h3>
                <ChatStatusIndicator status={session.status} />
              </div>
            </div>
          </div>

          {/* Right side - Action buttons */}
          <div className="flex items-center  justify-end   gap-2  w-full">
            {onShowGuestInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={onShowGuestInfo}
                className="text-xs  sm:flex"
              >
                <User className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Guest Info</span>
              </Button>
            )}

            {onRequestCustomerInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestEmail}
                disabled={session.status !== "ACTIVE" || isRequestingEmail}
                className="text-xs"
              >
                {isRequestingEmail ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    <span className="hidden md:inline">Requesting...</span>
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-1" />
                    <span className="hidden md:inline">Ask for Email</span>
                  </>
                )}
              </Button>
            )}
            
            {onBlockCustomer && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBlockCustomer(session._id)}
                disabled={session.status !== "ACTIVE"}
                className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <ShieldX className="h-4 w-4 mr-1" />
                <span className="hidden md:inline">Block</span>
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
                    {session.appointmentBooked ? "Book Now" : "Book Now"}
                  </span>
                </>
              )}
            </Button>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onEnd(session._id)}
              disabled={session.status !== "ACTIVE"}
              className="text-2xs"
            >
              <XCircle className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline text-xs">End Chat</span>
            </Button>
          </div>
        </div>


        {/* show the link and the Location of the visitor */}
        {session.customerId?.metadata?.initialDomain && (
          <div className="mt-3    rounded-none gap-2 flex flex-row">
            <div className="flex items-center gap-2 text-sm  font-medium">
              <Badge variant="outline" className="rounded-full">
                <Globe className="w-4 h-4" />
                <Link href={session?.customerId?.metadata?.currentPageUrl || "#"} className="text-blue-500">  {session?.customerId?.metadata?.currentPageUrl?.split("?")[0] || "N/A"}</Link>
              </Badge>

            </div>
            <div className="flex items-center gap-2 text-sm  font-medium">
              <Badge variant="outline" className="rounded-full">
                <MapPin className="w-4 h-4" />
                {session.customerId?.metadata?.ipInfo.city} {session.customerId?.metadata?.ipInfo.country}
              </Badge>
            </div>
          </div>
        )}

        {/* Care message or Appointment info */}
        {session.appointmentBooked && session.appointmentData && (
          <div className="mt-3 p-3 bg-gradient-to-r from-green-100 to-transparent rounded-none">
            <div className="flex items-center gap-2 text-sm text-green-800 font-medium">
              <Calendar className="w-4 h-4" />
              <span>Appointment Booked</span>
            </div>
            <div className="text-sm text-green-700 mt-1">
              {formatAppointmentDate(session.appointmentData?.date || "", "EEEE, MMMM dd, yyyy 'at' h:mm a")}
            </div>
            {session.appointmentData.notes && (
              <div className="text-sm text-green-600 mt-1">
                Note: {session.appointmentData.notes}
              </div>
            )}
          </div>
        ) }
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
