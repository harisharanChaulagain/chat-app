import React, { useEffect, useRef } from 'react'
import ChatMessage from './ui/ChatMessage'
import { useGetMessage } from '@/hooks/useGetMessage'
import useConversationStore from '@/store/useConversationStore';

type Message = {
  _id: string;
  senderId: string;
  receiverId: string;
  message: string;
  createdAt: string;
  updatedAt: string;
};

export default function Message() {
  const { data = [], isLoading, error } = useGetMessage();
  const { currentChatUser } = useConversationStore();

  const lastMessageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (lastMessageRef.current) {
        lastMessageRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  }, [data]);

  return (
    <div className="text-white overflow-y-auto max-h-[calc(100vh-200px)] px-4 py-2">
      {data.map((msg: Message, index) => {
        const isLast = index === data.length - 1;
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
