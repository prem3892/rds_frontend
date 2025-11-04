"use client";

import { Suspense } from "react";
import MyChatsPage from "./chat-page-content";

export default function ChatPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MyChatsPage />
    </Suspense>
  );
}
