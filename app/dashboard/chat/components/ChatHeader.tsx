import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle } from "lucide-react";
import { ChatSession } from "@/types";

interface ChatHeaderProps {
  session: ChatSession;
  onResolve: (sessionId: string) => void;
  onEnd: (sessionId: string) => void;
}

const ChatHeader = ({ session, onResolve, onEnd }: ChatHeaderProps) => {
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

  return (
    <header className="p-3.5 border-b bg-background dark:bg-slate-800 dark:border-slate-700 flex justify-between items-center shadow-sm">
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
          onClick={() => onResolve(session._id)}
          disabled={session.status !== "ACTIVE"}
        >
          <CheckCircle2 className="h-4 w-4 mr-1.5" /> Resolve
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
  );
};

export default ChatHeader;
