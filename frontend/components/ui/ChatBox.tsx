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

    const canSend = Boolean(message.trim());

    return (
        <div className="flex items-center gap-2 p-2.5 sm:gap-2.5 sm:p-3">
            <input
                type="text"
                value={message}
                onChange={handleChange}
                onKeyDown={handleKeyPress}
                placeholder="Message…"
                aria-label="Message"
                /* Pill composer; 16px base keeps iOS Safari from zooming the
                   viewport on focus. */
                className="field field-sunken min-w-0 flex-1 rounded-full px-4 py-2.5"
            />
            <button
                onClick={handleSend}
                disabled={!canSend}
                aria-label="Send message"
                title="Send message"
                className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full text-white transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                    background: canSend ? 'var(--gradient-brand)' : 'var(--muted-2)',
                    boxShadow: canSend ? 'var(--shadow-brand)' : 'none',
                }}
            >
                <Send className="h-[18px] w-[18px] -translate-x-px" />
            </button>
        </div>
    );
};

export default ChatBox;
