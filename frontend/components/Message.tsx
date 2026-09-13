"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { AlertCircle, MessageCircleHeart } from "lucide-react";
import ChatMessage from "./ui/ChatMessage";
import CallLogMessage from "./ui/CallLogMessage";
import { useGetMessage } from "@/hooks/useGetMessage";
import useConversationStore from "@/store/useConversationStore";
import useGetSocketMessage from "@/context/useGetSocketMessage";
import { useUserStore } from "@/store/userStore";

/** Shared scroll-area shell so every state sits in the same box. */
const THREAD_CLASSES =
  "min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-5";

export default function Message() {
  const { messages, addMessagesAtStart, typingUser, selectedConversation } = useConversationStore();
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
      const { scrollTop } = container;

      if (scrollTop <= 10 && !isLoading && data?.totalPages && page < data.totalPages - 1) {
        setPrevScrollHeight(container.scrollHeight);
        setPage((prev) => prev + 1);
      }
    },
    [data, isLoading, page]
  );

  if (isLoading && page === 0)
    return (
      <div className={THREAD_CLASSES}>
        <BubbleSkeletons />
      </div>
    );

  if (error)
    return (
      <div className={`${THREAD_CLASSES} flex items-center justify-center`}>
        <div className="flex max-w-xs flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border border-[var(--danger)]/20 bg-[var(--danger-soft)]">
            <AlertCircle className="h-6 w-6 text-[var(--danger)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">
            Couldn&apos;t load messages
          </p>
          <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
            Something went wrong fetching this conversation.
          </p>
        </div>
      </div>
    );

  return (
    <div
      ref={messageContainerRef}
      className={THREAD_CLASSES}
      onScroll={handleScroll}
    >
      {/* Loading older pages: a quiet inline pill rather than a layout shift. */}
      {isLoading && page > 0 && (
        <div className="mb-4 flex justify-center">
          <span className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-medium text-[var(--muted)]">
            <span className="spinner h-3.5 w-3.5" />
            Loading earlier messages
          </span>
        </div>
      )}

      {messages.length === 0 && (
        <div className="flex h-full flex-col items-center justify-center px-4 text-center animate-fade-in">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-xs)]">
            <MessageCircleHeart className="h-7 w-7 text-[var(--primary)]" />
          </div>
          <p className="text-sm font-semibold text-[var(--text)]">
            Say hello to {selectedConversation?.name?.split(" ")[0] ?? "them"}
          </p>
          <p className="mt-1 max-w-xs text-[13px] leading-relaxed text-[var(--muted)]">
            This is the very beginning of your conversation.
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        {messages.map((msg, index) => {
          const isSender = msg.senderId?._id === user?._id;
          const timestamp = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          if (msg.messageType === "call" && msg.callInfo) {
            return (
              <CallLogMessage
                key={`${msg._id}-${index}`}
                callInfo={msg.callInfo}
                isSender={isSender}
                timestamp={timestamp}
              />
            );
          }

          return (
            <ChatMessage
              key={`${msg._id}-${index}`}
              message={msg.message}
              isSender={isSender}
              avatarUrl="https://i.pravatar.cc/150?img=8"
              timestamp={timestamp}
            />
          );
        })}

        {typingUser === selectedConversation?._id && (
          <div className="flex items-end gap-2 animate-message-in">
            <img
              src="https://i.pravatar.cc/150?img=8"
              alt=""
              aria-hidden="true"
              className="h-7 w-7 flex-shrink-0 rounded-full bg-[var(--surface-2)] object-cover ring-1 ring-[var(--border)]"
            />
            <div
              className="rounded-[18px] rounded-bl-[6px] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-xs)]"
              role="status"
              aria-label={`${selectedConversation?.name ?? "They"} is typing`}
            >
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-typing-dot" />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-typing-dot"
                  style={{ animationDelay: "0.15s" }}
                />
                <span
                  className="h-1.5 w-1.5 rounded-full bg-[var(--muted)] animate-typing-dot"
                  style={{ animationDelay: "0.3s" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Alternating in/out placeholder bubbles while the first page loads. */
const BubbleSkeletons = () => {
  const rows = [
    { mine: false, width: "62%" },
    { mine: true, width: "48%" },
    { mine: false, width: "70%" },
    { mine: true, width: "38%" },
    { mine: false, width: "54%" },
    { mine: true, width: "60%" },
  ];

  return (
    <div className="space-y-3">
      {rows.map((row, index) => (
        <div
          key={index}
          className={`flex items-end gap-2 ${row.mine ? "justify-end" : "justify-start"}`}
        >
          {!row.mine && <div className="skeleton h-7 w-7 flex-shrink-0 rounded-full" />}
          <div
            className={`skeleton h-11 ${row.mine ? "rounded-[18px] rounded-br-[6px]" : "rounded-[18px] rounded-bl-[6px]"}`}
            style={{ width: row.width, maxWidth: "18rem" }}
          />
          {row.mine && <div className="skeleton h-7 w-7 flex-shrink-0 rounded-full" />}
        </div>
      ))}
    </div>
  );
};
