import React from "react";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ChatSession } from "@/types";

interface PendingChatRequestCardProps {
  session: ChatSession;
  onAccept: (sessionId: string) => void;
}

const PendingChatRequestCard = ({
  session,
  onAccept,
}: PendingChatRequestCardProps) => (
  <Card
    key={session._id}
    className="mb-2 p-3 hover:shadow-md transition-shadow cursor-pointer bg-amber-50 dark:bg-amber-800/20 border-amber-500 dark:border-amber-600"
    onClick={() => onAccept(session._id)}
  >
    <div className="flex justify-between w-full items-center mb-1">
      <span className="font-semibold text-sm text-amber-700 dark:text-amber-400">
        {typeof session.customerId === "object"
          ? session.customerId?.firstName ||
            session.customerId?.email ||
            session.customerId._id.slice(-6)
          : session.customerId.slice(-6)}
      </span>
      <Badge variant="destructive" className="bg-amber-500 text-amber-50">
        NEW
      </Badge>
    </div>
    <p className="text-xs text-amber-600 dark:text-amber-500">
      Dept:{" "}
      {session.department?.name ||
        (typeof session.departmentId === "object" &&
          session.departmentId?.name) ||
        (typeof session.departmentId === "string" &&
          session.departmentId?.slice(-6)) ||
        "N/A"}
    </p>
    <p className="text-xs text-amber-600 dark:text-amber-500">
      {formatDistanceToNowStrict(parseISO(session.createdAt), {
        addSuffix: true,
      })}
    </p>
  </Card>
);

export default PendingChatRequestCard;
