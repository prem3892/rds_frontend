"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, getColorFromString } from "@/lib/utils";
import { useCreateContact, useGetContactsByCustomer, useUpdateContact } from "@/lib/contact.api";
import { ChatSession } from "@/types";
import { AnimatePresence, motion } from "framer-motion";
import {
  Clock,
  Globe,
  MapPin,
  User as UserIcon,
  X,
  Save,
  Loader2,
  Edit,
  Mail,
  Phone,
  User,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format, parseISO } from "date-fns";

interface GuestInfoProps {
  session: ChatSession | null;
  isOpen: boolean;
  onClose: () => void;
  onBlockGuest?: (sessionId: string) => void;
}

export function GuestInfo({
  session,
  isOpen,
  onClose,
  onBlockGuest,
}: GuestInfoProps) {
  const [contactForm, setContactForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [isEditingContact, setIsEditingContact] = useState(false);

  const createContactMutation = useCreateContact();
  const updateContactMutation = useUpdateContact();
  
  // Check if contacts exist for this customer
  const {
    data: existingContacts,
    isLoading: isLoadingContact,
    error: contactError,
  } = useGetContactsByCustomer(session?.customerId?._id || null, {
    retry: false, // Don't retry if contact doesn't exist
  });

  // Get the first contact if any exist
  const existingContact = existingContacts && existingContacts.length > 0 ? existingContacts[0] : null;

  if (!session) return null;

  const getCustomerName = () => {
    
      return session.customerId?.name || 
             session.customerId?.email || 
             `Guest${session.customerId._id.slice(-6)}`;
    
  };

  const getCustomerInitial = () => {
    if (typeof session.customerId === "object") {
      return session.customerId?.name?.charAt(0)?.toUpperCase() ||
             session.customerId?.email?.charAt(0)?.toUpperCase() ||
             "G";
    }
    return "G";
  };

  const getLastSeen = () => {
      if (session.lastMessageAt) {
      const date = new Date(session.lastMessageAt);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hour${Math.floor(diffInMinutes / 60) > 1 ? 's' : ''} ago`;
      return `${Math.floor(diffInMinutes / 1440)} day${Math.floor(diffInMinutes / 1440) > 1 ? 's' : ''} ago`;
    }
    return "Unknown";
  };

  const handleContactFormChange = (field: string, value: string) => {
    setContactForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveContact = async () => {
    if (!contactForm.firstName || !contactForm.lastName || !contactForm.email) {
      toast.error("Please fill in all required fields (First Name, Last Name, Email)");
      return;
    }

    try {
      await createContactMutation.mutateAsync({
        firstName: contactForm.firstName,
        lastName: contactForm.lastName,
        email: contactForm.email,
        phone: contactForm.phone,
        customer: session.customerId._id,
      });

      toast.success("Contact saved successfully!");
      setContactForm({ firstName: "", lastName: "", email: "", phone: "" });
    } catch (error) {
      toast.error("Failed to save contact");
      console.error("Error saving contact:", error);
    }
  };

  const handleUpdateContact = async () => {
    if (!existingContact || !contactForm.firstName || !contactForm.lastName || !contactForm.email) {
      toast.error("Please fill in all required fields (First Name, Last Name, Email)");
      return;
    }

    try {
      await updateContactMutation.mutateAsync({
        id: existingContact._id,
        data: {
          firstName: contactForm.firstName,
          lastName: contactForm.lastName,
          email: contactForm.email,
          phone: contactForm.phone,
        },
      });

      toast.success("Contact updated successfully!");
      setIsEditingContact(false);
    } catch (error) {
      toast.error("Failed to update contact");
      console.error("Error updating contact:", error);
    }
  };

  const handleEditContact = () => {
    if (existingContact) {
      setContactForm({
        firstName: existingContact.firstName,
        lastName: existingContact.lastName,
        email: existingContact.email,
        phone: existingContact.phone,
      });
      setIsEditingContact(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingContact(false);
    setContactForm({ firstName: "", lastName: "", email: "", phone: "" });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 bg-opacity-50 z-40 "
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full max-w-xl  bg-white shadow-2xl z-50"
          >
            <div className="flex flex-col h-full ">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-">
                <div className="flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">Guest Info</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Content */}
              <ScrollArea className="flex-1 p-4 overflow-y-auto ">
                {/* Enable horizontal scrolling for wide content */}
                <div className="w-full overflow-x-auto ">
                <div className="space-y-6  ">
                  {/* Guest Basic Info */}
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={undefined} />
                      <AvatarFallback className={cn(
                        "text-white font-medium",
                        getColorFromString(getCustomerName())
                      )}>
                        {getCustomerInitial()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{getCustomerName()}</h3>
                      <p className="text-sm text-gray-600">{session.customerId.metadata?.ipInfo.city || ""} {session.customerId.metadata?.ipInfo.country || ""}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onBlockGuest?.(session._id)}
                      className="text-xs"
                    >
                      Block Guest
                    </Button>
                  </div>

                  {/* Contact Details */}
                  <Card className="max-w-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-semibold">Contact Details</CardTitle>
                        {existingContact && !isEditingContact && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEditContact}
                            className="text-xs"
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isLoadingContact ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="ml-2 text-sm text-gray-500">Loading contact...</span>
                        </div>
                      ) : existingContact && !isEditingContact ? (
                        // Show existing contact details
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Name:</span>
                            <span className="font-medium">
                              {existingContact.firstName} {existingContact.lastName}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Email:</span>
                            <span className="font-medium">{existingContact.email}</span>
                          </div>
                          {existingContact.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-500" />
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-medium">{existingContact.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Saved:</span>
                            <span className="font-medium">
                              {new Date(existingContact.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Show contact form (for new contact or editing)
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <Label htmlFor="firstName" className="text-sm font-medium">First Name *</Label>
                            <Input
                              id="firstName"
                              placeholder="Enter first name"
                              value={contactForm.firstName}
                              onChange={(e) => handleContactFormChange("firstName", e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastName" className="text-sm font-medium">Last Name *</Label>
                            <Input
                              id="lastName"
                              placeholder="Enter last name"
                              value={contactForm.lastName}
                              onChange={(e) => handleContactFormChange("lastName", e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="Enter email"
                              value={contactForm.email}
                              onChange={(e) => handleContactFormChange("email", e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">Phone:</Label>
                            <Input
                              id="phone"
                              placeholder="Enter phone number"
                              value={contactForm.phone}
                              onChange={(e) => handleContactFormChange("phone", e.target.value)}
                              className="text-sm"
                            />
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={isEditingContact ? handleUpdateContact : handleSaveContact}
                              disabled={createContactMutation.isPending || updateContactMutation.isPending}
                              className="flex-1"
                            >
                              {(createContactMutation.isPending || updateContactMutation.isPending) ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {isEditingContact ? "Updating..." : "Saving..."}
                                </>
                              ) : (
                                <>
                                  <Save className="mr-2 h-4 w-4" />
                                  {isEditingContact ? "Update Contact" : "Save Contact"}
                                </>
                              )}
                            </Button>
                            {isEditingContact && (
                              <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Guest Details */}
                  <Card className="max-w-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold">Guest Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Last Seen:</span>
                        <span className="font-medium">{getLastSeen()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Region:</span>
                       {
                       session.customerId.metadata?.ipInfo.city &&
                       <span className="font-medium">{session.customerId.metadata?.ipInfo.city }</span>}
                      </div>
                      
                      {/* <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Last Visited Pages:</span>
                        <span className="font-medium truncate">
                          &gt;&gt; At: {session.initialMessage || "testing-chat-app-theta.vercel.app/"}
                        </span>
                      </div> */}
                      
                      <Link href={`https://${session.customerId.metadata?.initialDomain || "N/A"}`} className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Source:</span>
                        <Badge className="font-medium truncate text-[10px] " variant={"outline"}>{session.customerId.metadata?.initialDomain || "N/A"}</Badge>
                      </Link>
                    </CardContent>
                  </Card>

                  {/* Appointment Information */}
                  {session.appointmentBooked && session.appointmentData && (
                    <Card className="max-w-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-600" />
                          Appointment Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-green-500" />
                          <span className="text-gray-600">Date & Time:</span>
                          <span className="font-medium text-green-700">
                            {format(parseISO(session.appointmentData.date), "EEEE, MMMM dd, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        {session.appointmentData.notes && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-gray-600 mt-0.5">Notes:</span>
                            <span className="font-medium text-gray-800">{session.appointmentData.notes}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-600">Booked:</span>
                          <span className="font-medium">
                            {format(parseISO(session.appointmentData.bookedAt), "MMM dd, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default GuestInfo;
