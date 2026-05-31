"use client";

import { useSocket } from '@/context/SocketContext';
import { useSendMessage } from '@/hooks/useSendMessage';
import useConversationStore from '@/store/useConversationStore';
import { Send } from 'lucide-react';
import React, { useState, KeyboardEvent, useRef } from 'react';

const ChatBox = () => {
    const [message, setMessage] = useState('');

    const { selectedConversation } = useConversationStore();
    const { mutate: sendMessage } = useSendMessage();

    const handleSend = () => {
        if (!selectedConversation || !message.trim()) return;
        sendMessage({
            message,
            id: selectedConversation._id,
        });
        setMessage('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    const { socket } = useSocket();
    const typingTimeout = useRef<NodeJS.Timeout | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);

        if (!socket || !selectedConversation) return;

        socket.emit("typing", {
            receiverId: selectedConversation._id,
            isTyping: true,
        });

        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }

        typingTimeout.current = setTimeout(() => {
            socket.emit("typing", {
                receiverId: selectedConversation._id,
                isTyping: false,
            });
        }, 1000);
    };

    return (
        <div className="flex items-center gap-2 p-3 bg-slate-900 border-t border-slate-700">
            <input
                type="text"
                value={message}
                // onChange={(e) => setMessage(e.target.value)}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 rounded-lg bg-slate-800 text-white focus:outline-none"
            />
            <button
                onClick={handleSend}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer"
            >
                <Send />
            </button>
        </div>
    );
};

export default ChatBox;
