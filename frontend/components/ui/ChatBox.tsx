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
        <div className="flex items-center gap-2 border-t border-slate-700 bg-slate-900 p-2.5 sm:gap-3 sm:p-3">
            <input
                type="text"
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                aria-label="Message"
                /* 16px base keeps iOS Safari from zooming the viewport on focus. */
                className="min-w-0 flex-1 rounded-lg bg-slate-800 px-3 py-2.5 text-base text-white focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm"
            />
            <button
                onClick={handleSend}
                disabled={!message.trim()}
                aria-label="Send message"
                className="flex h-11 w-11 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg bg-blue-600 text-white transition duration-200 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:h-auto sm:w-auto sm:px-4 sm:py-2.5"
            >
                <Send className="h-5 w-5" />
            </button>
        </div>
    );
};

export default ChatBox;
