import React from "react";
import clsx from "clsx";

type ChatMessageProps = {
    message?: string;
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
                "flex items-end mb-2",
                isSender ? "justify-end" : "justify-start"
            )}
        >
            {!isSender && avatarUrl && (
                <img
                    src={avatarUrl}
                    alt="avatar"
                    className="mr-2 h-8 w-8 flex-shrink-0 rounded-full"
                />
            )}

            {/* Percentage cap instead of a fixed `max-w-xs`: on a 360px phone a
                320px bubble plus the avatar overflowed the row. */}
            <div
                className={clsx(
                    "max-w-[75%] px-3.5 py-2 text-sm break-words sm:max-w-md sm:px-4 md:max-w-lg",
                    isSender
                        ? "bg-blue-500 text-white rounded-l-2xl rounded-tr-3xl"
                        : "bg-gray-200 text-black rounded-r-2xl rounded-tl-3xl"
                )}
            >
                <p className="whitespace-pre-wrap">{message}</p>

                {timestamp && (
                    <span
                        className={clsx(
                            "mt-1 block text-right text-[10px]",
                            isSender ? "text-blue-100" : "text-gray-500"
                        )}
                    >
                        {timestamp}
                    </span>
                )}
            </div>

            {isSender && avatarUrl && (
                <img
                    src={avatarUrl}
                    alt="avatar"
                    className="ml-2 h-8 w-8 flex-shrink-0 rounded-full"
                />
            )}
        </div>
    );
};

export default ChatMessage;