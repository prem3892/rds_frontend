"use client";

import { Suspense } from "react";
import MyChatsPage from "./ChatPageContent";

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading chat...</div>}>
      <MyChatsPage />
    </Suspense>
  );
}
