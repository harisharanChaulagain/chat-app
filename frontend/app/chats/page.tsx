"use client";

import React from "react";
import ChatList from "@/components/ChatList";
import ChatWindow from "@/components/ChatWindow";
import useConversationStore from "@/store/useConversationStore";
import Sidebar from "../components/Sidebar";

export default function ChatsPage() {
  const { selectedConversation } = useConversationStore();

  return (
    /* One non-scrolling app shell; the list and the thread scroll internally.
       On mobile the two panes swap places instead of sitting side by side, so
       the open thread gets the whole viewport (see ChatList / ChatWindow). */
    <div className="flex h-screen-dvh w-full overflow-hidden bg-[var(--bg)]">
      <Sidebar mobileHidden={Boolean(selectedConversation)} />
      <ChatList />
      <ChatWindow />
    </div>
  );
}
