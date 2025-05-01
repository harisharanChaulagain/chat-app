import React from 'react';
import clsx from 'clsx';

type ChatMessageProps = {
    message: string;
    timestamp?: string;
    isSender: boolean;
    avatarUrl?: string;
};

const ChatMessage: React.FC<ChatMessageProps> = ({
    message,
    timestamp,
    isSender,
    avatarUrl,
}) => {
    return (
        <div
            className={clsx(
                'flex items-end mb-2',
                isSender ? 'justify-end' : 'justify-start'
            )}
        >
            {!isSender && avatarUrl && (
                <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-8 h-8 rounded-full mr-2"
                />
            )}

            <div className={clsx(
                'max-w-xs px-4 py-2 rounded-lg text-sm',
                isSender
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-black rounded-bl-none'
            )}>
                <p>{message}</p>
                {timestamp && (
                    <span className="text-[10px] block text-right text-gray-300 mt-1">
                        {timestamp}
                    </span>
                )}
            </div>

            {isSender && avatarUrl && (
                <img
                    src={avatarUrl}
                    alt="avatar"
                    className="w-8 h-8 rounded-full ml-2"
                />
            )}
        </div>
    );
};

export default ChatMessage;
