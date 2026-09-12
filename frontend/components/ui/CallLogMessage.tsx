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
                "flex items-end mb-2",
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
                    "flex max-w-[75%] items-center gap-3 border px-3.5 py-2 text-left text-sm transition-colors sm:max-w-md sm:px-4 md:max-w-lg",
                    "rounded-2xl",
                    canCallBack
                        ? "cursor-pointer hover:bg-slate-700/60"
                        : "cursor-default",
                    missed
                        ? "border-red-500/40 bg-red-500/10"
                        : "border-slate-600/60 bg-slate-800/60"
                )}
            >
                <span
                    className={clsx(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
                        missed ? "bg-red-500/20" : "bg-slate-600/60"
                    )}
                >
                    <Icon
                        size={16}
                        className={missed ? "text-red-400" : "text-slate-200"}
                    />
                </span>

                <span className="min-w-0">
                    <span
                        className={clsx(
                            "block truncate font-medium",
                            missed ? "text-red-300" : "text-slate-100"
                        )}
                    >
                        {label}
                    </span>

                    <span className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                        {detail && <span className="tabular-nums">{detail}</span>}
                        {detail && timestamp && <span aria-hidden="true">·</span>}
                        {timestamp && <span>{timestamp}</span>}
                    </span>
                </span>
            </button>
        </div>
    );
};

export default CallLogMessage;
