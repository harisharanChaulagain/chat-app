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
                "group flex items-end gap-2 animate-message-in",
                isSender ? "justify-end" : "justify-start"
            )}
        >
            {!isSender && avatarUrl && (
                <img
                    src={avatarUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-7 w-7 flex-shrink-0 rounded-full bg-[var(--surface-2)] object-cover ring-1 ring-[var(--border)]"
                />
            )}

            {/* Percentage cap instead of a fixed `max-w-xs`: on a 360px phone a
                320px bubble plus the avatar overflowed the row. The flattened
                bottom corner on the sender's side is the tail. */}
            <div
                className={clsx(
                    "max-w-[76%] px-3.5 py-2 text-[15px] leading-[1.45] break-words sm:max-w-md sm:px-4 md:max-w-lg",
                    isSender
                        ? "rounded-[var(--radius-xl)] rounded-br-[5px] bg-[var(--primary-fill)] text-white"
                        : "rounded-[var(--radius-xl)] rounded-bl-[5px] border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]"
                )}
            >
                <p className="whitespace-pre-wrap">{message}</p>

                {timestamp && (
                    <span
                        className={clsx(
                            "mt-1 block text-right text-[11px] tabular-nums",
                            isSender ? "text-white/70" : "text-[var(--muted-2)]"
                        )}
                    >
                        {timestamp}
                    </span>
                )}
            </div>

            {isSender && avatarUrl && (
                <img
                    src={avatarUrl}
                    alt=""
                    aria-hidden="true"
                    className="h-7 w-7 flex-shrink-0 rounded-full bg-[var(--surface-2)] object-cover ring-1 ring-[var(--border)]"
                />
            )}
        </div>
    );
};

export default ChatMessage;
