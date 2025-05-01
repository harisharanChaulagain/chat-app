"use client";

import { Send } from 'lucide-react';
import React, { useState, KeyboardEvent } from 'react';

type ChatBoxProps = {
    onSend: (message: string) => void;
};

const ChatBox: React.FC<ChatBoxProps> = ({ onSend }) => {
    const [text, setText] = useState('');

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed) return;
        onSend(trimmed);
        setText('');
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSend();
    };

    return (
        <div className="flex items-center gap-2 p-3 bg-slate-900 border-t border-slate-700">
            <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 p-2 rounded-lg bg-slate-800 text-white focus:outline-none"
            />
            <button
                onClick={handleSend}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 cursor-pointer"
            >
                <Send/>
            </button>
        </div>
    );
};

export default ChatBox;
