import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AskForEmailButtonProps {
  chatSessionId: string;
  onRequestCustomerInfo: (chatSessionId: string) => Promise<boolean>;
  disabled?: boolean;
}

const AskForEmailButton: React.FC<AskForEmailButtonProps> = ({
  chatSessionId,
  onRequestCustomerInfo,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestEmail = async () => {
    if (!chatSessionId || isLoading) return;

    setIsLoading(true);
    try {
      const success = await onRequestCustomerInfo(chatSessionId);
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
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleRequestEmail}
      disabled={disabled || isLoading}
      size="sm"
      variant="outline"
      className="h-8 px-3 text-xs font-medium bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
      title="Ask customer for email address"
    >
      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin mr-1" />
      ) : (
        <Mail className="h-3 w-3 mr-1" />
      )}
      Ask for Email
    </Button>
  );
};

export default AskForEmailButton;
