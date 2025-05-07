"use client";

import React, { useEffect, useRef } from 'react';
import ChatMessage from './ui/ChatMessage';
import { useGetMessage } from '@/hooks/useGetMessage';
import useConversationStore from '@/store/useConversationStore';
import useGetSocketMessage from '@/context/useGetSocketMessage';

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export default function Message() {
  const { currentChatUser, messages, setMessages } = useConversationStore();
  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  const { data = [], isLoading, error } = useGetMessage();

  useEffect(() => {
    if (data.length > 0) {
      setMessages(data); 
    }
  }, [data, setMessages]);

  useGetSocketMessage();

  useEffect(() => {
    setTimeout(() => {
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, [messages]);

  if (isLoading) return <div className="text-white p-4">Loading messages...</div>;
  if (error) return <div className="text-red-500 p-4">Failed to load messages.</div>;

  return (
    <div className="text-white overflow-y-auto max-h-[calc(100vh-200px)] px-4 py-2">
      {messages.map((msg: any, index: number) => {
        const isLast = index === messages.length - 1;
        return (
          <div key={msg._id} ref={isLast ? lastMessageRef : null}>
            <ChatMessage
              message={msg.message}
              isSender={msg.senderId === currentChatUser}
              avatarUrl="https://i.pravatar.cc/150?img=8"
              timestamp={new Date(msg.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            />
          </div>
        );
      })}
    </div>
  );
}
