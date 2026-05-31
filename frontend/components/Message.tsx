"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import ChatMessage from "./ui/ChatMessage";
import { useGetMessage } from "@/hooks/useGetMessage";
import useConversationStore from "@/store/useConversationStore";
import useGetSocketMessage from "@/context/useGetSocketMessage";
import { useUserStore } from "@/store/userStore";

export default function Message() {
  const { currentChatUser, messages, addMessagesAtStart, typingUser, selectedConversation } = useConversationStore();
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const [page, setPage] = useState(0);
  const limit = 15;
  const [prevScrollHeight, setPrevScrollHeight] = useState<number>(0);

  const { data, isLoading, error } = useGetMessage(page, limit);

  const user = useUserStore((state) => state.user);

  useEffect(() => {
    if (data && data.messages?.length) {
      addMessagesAtStart(data.messages);
    }
  }, [data, addMessagesAtStart]);

  useEffect(() => {
    if (page === 0 && messages.length > 0) {
      setTimeout(() => {
        if (messageContainerRef.current) {
          messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [messages, page]);

  useEffect(() => {
    if (page > 0 && messageContainerRef.current) {
      const container = messageContainerRef.current;
      container.scrollTop = container.scrollHeight - prevScrollHeight;
    }
  }, [messages]);

  useGetSocketMessage();

  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const container = event.currentTarget;
      const { scrollTop, scrollHeight } = container;

      if (scrollTop <= 10 && !isLoading && data?.totalPages && page < data.totalPages - 1) {
        setPrevScrollHeight(container.scrollHeight);
        setPage((prev) => prev + 1);
      }
    },
    [data, isLoading, page]
  );

  if (isLoading && page === 0) return <div className="text-white p-4">Loading messages...</div>;
  if (error) return <div className="text-red-500 p-4">Failed to load messages.</div>;
  return (
    <div
      ref={messageContainerRef}
      className="text-white overflow-y-auto max-h-[calc(100vh-150px)] px-4 py-2"
      onScroll={handleScroll}
    >
      {messages.map((msg, index) => (
        <ChatMessage
          key={`${msg._id}-${index}`}
          message={msg.message}
          isSender={msg.senderId._id === user?._id}
          avatarUrl="https://i.pravatar.cc/150?img=8"
          timestamp={new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        />
      ))}

      {typingUser === selectedConversation?._id &&
        <div
          className="flex items-end mb-2justify-start"
        >
          <img
            src="https://i.pravatar.cc/150?img=8"
            alt="avatar"
            className="w-8 h-8 rounded-full mr-2"
          />
          <div
            className="max-w-xs px-4 py-2 text-sm bg-gray-200 text-black rounded-r-2xl rounded-tl-3xl"
          >
            <div className="flex gap-1 py-1">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
              <span
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <span
                className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>

        </div>}

    </div>
  );
}
