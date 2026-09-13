"use client";

import React from "react";
import clsx from "clsx";
import { Phone, PhoneMissed, Video } from "lucide-react";
import { useCall } from "@/context/CallContext";
import { useSocket } from "@/context/SocketContext";
import useConversationStore from "@/store/useConversationStore";
import { describeCallLog } from "@/lib/callFormat";
import { CallLogInfo } from "@/types/call";

type CallLogMessageProps = {
    callInfo: CallLogInfo;
    /** True when the viewer placed this call. Drives both side and wording. */
    isSender: boolean;
    timestamp?: string;
};

/**
 * A call's entry in the chat thread — type, outcome, duration — and a shortcut
 * to call back, the way Messenger surfaces call history.
 */
const CallLogMessage: React.FC<CallLogMessageProps> = ({
    callInfo,
    isSender,
    timestamp,
}) => {
    const { startCall, status } = useCall();
    const { onlineUsers } = useSocket();
    const { selectedConversation } = useConversationStore();

    const { label, detail, tone } = describeCallLog(callInfo, isSender);
    const missed = tone === "missed";

    const isOnline = selectedConversation
        ? onlineUsers.includes(selectedConversation._id)
        : false;
    // Same guard the header's call buttons use — no dialling into a live call
    // or at someone who has gone offline.
    const canCallBack = Boolean(selectedConversation) && isOnline && status === "idle";

    const Icon = missed ? PhoneMissed : callInfo.callType === "video" ? Video : Phone;

    const handleCallBack = () => {
        if (!canCallBack || !selectedConversation) return;
        startCall(
            { _id: selectedConversation._id, name: selectedConversation.name },
            callInfo.callType
        );
    };

    return (
        <div
            className={clsx(
                "flex items-end animate-message-in",
                isSender ? "justify-end" : "justify-start"
            )}
        >
            <button
                type="button"
                onClick={handleCallBack}
                disabled={!canCallBack}
                title={
                    canCallBack
                        ? `Call ${selectedConversation?.name} back`
                        : label
                }
                aria-label={`${label}${detail ? `, ${detail}` : ""}`}
                className={clsx(
                    // Matches ChatMessage's responsive cap so call entries sit in
                    // the same column as the bubbles around them.
                    "flex max-w-[76%] items-center gap-3 rounded-[18px] border px-3 py-2 text-left shadow-[var(--shadow-xs)] transition-colors duration-150 sm:max-w-md sm:px-3.5 md:max-w-lg",
                    canCallBack ? "cursor-pointer" : "cursor-default",
                    missed
                        ? clsx(
                            "border-[var(--danger)]/25 bg-[var(--danger-soft)]",
                            canCallBack && "hover:border-[var(--danger)]/45"
                        )
                        : clsx(
                            "border-[var(--border)] bg-[var(--surface)]",
                            canCallBack && "hover:border-[var(--border-strong)] hover:bg-[var(--surface-2)]"
                        )
                )}
            >
                <span
                    className={clsx(
                        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full",
                        missed
                            ? "bg-[var(--danger)]/15 text-[var(--danger-text)]"
                            : "bg-[var(--primary-soft-strong)] text-[var(--primary)]"
                    )}
                >
                    <Icon size={16} />
                </span>

                <span className="min-w-0">
                    <span
                        className={clsx(
                            "block truncate text-sm font-semibold",
                            missed ? "text-[var(--danger-text)]" : "text-[var(--text)]"
                        )}
                    >
                        {label}
                    </span>

                    <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                        {detail && <span className="tabular-nums">{detail}</span>}
                        {detail && timestamp && <span aria-hidden="true">·</span>}
                        {timestamp && <span className="tabular-nums">{timestamp}</span>}
                    </span>
                </span>
            </button>
        </div>
    );
};

export default CallLogMessage;
