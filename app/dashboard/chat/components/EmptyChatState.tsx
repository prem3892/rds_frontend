import React from "react";
import { MessageSquarePlus } from "lucide-react";

const EmptyChatState = () => (
  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 bg-slate-50 dark:bg-slate-900/70">
    <MessageSquarePlus className="h-16 w-16 mb-4 opacity-30" />
    <p className="text-lg font-medium">Select a chat to view messages</p>
    <p className="text-sm">Or accept a new pending request from the sidebar.</p>
  </div>
);

export default EmptyChatState;
