"use client";

import React, { useEffect, useRef } from "react";
import {
    Mic,
    MicOff,
    Phone,
    PhoneOff,
    Video,
    VideoOff,
} from "lucide-react";
import { useCall } from "@/context/CallContext";
import { CALL_END_MESSAGES } from "@/types/call";
import { formatCallDuration } from "@/lib/callFormat";

const getInitials = (name: string) => name.trim().charAt(0).toUpperCase() || "?";

const CallModal = () => {
    const {
        status,
        callType,
        peerName,
        endReason,
        localStream,
        remoteStream,
        isMicOn,
        isCameraOn,
        duration,
        acceptCall,
        declineCall,
        hangUp,
        toggleMic,
        toggleCamera,
    } = useCall();

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const element = localVideoRef.current;
        if (element && element.srcObject !== localStream) {
            element.srcObject = localStream;
        }
    }, [localStream, status]);

    // The remote element carries the call audio too, so it stays mounted for
    // audio-only calls — just sized down to nothing instead of unmounted.
    useEffect(() => {
        const element = remoteVideoRef.current;
        if (!element) return;
        if (element.srcObject !== remoteStream) element.srcObject = remoteStream;
        if (remoteStream) void element.play().catch(() => undefined);
    }, [remoteStream, status]);

    if (status === "idle") return null;

    const isVideoCall = callType === "video";
    const isLive = status === "connecting" || status === "connected";
    const callLabel = isVideoCall ? "video call" : "audio call";

    const statusText = (() => {
        switch (status) {
            case "calling":
                return `Ringing…`;
            case "ringing":
                return `Incoming ${callLabel}`;
            case "connecting":
                return "Connecting…";
            case "connected":
                return formatCallDuration(duration);
            case "ended":
                return endReason ? CALL_END_MESSAGES[endReason] : "Call ended";
            default:
                return "";
        }
    })();

    const avatar = (size: "lg" | "sm", pulse = false) => (
        <div className="relative">
            {pulse && (
                <span
                    className="absolute inset-0 rounded-full animate-pulse-ring"
                    style={{ background: "var(--gradient-subtle)" }}
                />
            )}
            <div
                className={`relative flex items-center justify-center rounded-full font-semibold text-white ${
                    size === "lg"
                        ? "h-24 w-24 text-4xl sm:h-32 sm:w-32 sm:text-5xl"
                        : "h-20 w-20 text-2xl sm:h-24 sm:w-24 sm:text-3xl"
                }`}
                style={{
                    background: "var(--gradient-accent)",
                    boxShadow: "var(--shadow-glow-strong)",
                }}
            >
                {getInitials(peerName)}
            </div>
        </div>
    );

    const controlButton = (
        onClick: () => void,
        active: boolean,
        title: string,
        ActiveIcon: typeof Mic,
        InactiveIcon: typeof MicOff
    ) => (
        <button
            type="button"
            onClick={onClick}
            title={title}
            aria-label={title}
            aria-pressed={!active}
            className="flex h-12 w-12 items-center justify-center rounded-full border transition-colors sm:h-14 sm:w-14"
            style={{
                background: active ? "var(--glass-bg-strong)" : "var(--text-primary)",
                borderColor: "var(--glass-border)",
                color: active ? "var(--text-primary)" : "var(--text-inverse)",
            }}
        >
            {active ? <ActiveIcon size={22} /> : <InactiveIcon size={22} />}
        </button>
    );

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fade-in"
            style={{
                background: "rgba(10, 10, 15, 0.92)",
                backdropFilter: "blur(var(--glass-blur))",
                WebkitBackdropFilter: "blur(var(--glass-blur))",
            }}
            role="dialog"
            aria-modal="true"
            aria-label={`${callLabel} with ${peerName}`}
        >
            {/* Remote media. Kept mounted while live so audio keeps flowing. */}
            <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className={
                    isLive && isVideoCall
                        ? "absolute inset-0 h-full w-full bg-black object-cover"
                        : "pointer-events-none absolute h-0 w-0 opacity-0"
                }
            />

            {isLive ? (
                <>
                    {/* Caller identity, floating over the video */}
                    <header className="absolute top-0 left-0 right-0 flex items-center gap-3 p-4 sm:p-6">
                        <div
                            className="flex min-w-0 max-w-full items-center gap-2 rounded-full px-3 py-2 glass-strong sm:gap-3 sm:px-4"
                            style={{ borderRadius: "var(--radius-full)" }}
                        >
                            <span className="truncate font-semibold text-[var(--text-primary)]">
                                {peerName}
                            </span>
                            <span className="flex-shrink-0 text-xs tabular-nums text-[var(--text-secondary)] sm:text-sm">
                                {statusText}
                            </span>
                        </div>
                    </header>

                    {/* Audio-only calls, or video that has not arrived yet */}
                    {(!isVideoCall || !remoteStream) && (
                        <div className="flex flex-col items-center gap-5 px-6 sm:gap-6">
                            {avatar("lg", true)}
                            <div className="max-w-full text-center">
                                <h2 className="truncate text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
                                    {peerName}
                                </h2>
                                <p className="mt-1 text-sm tabular-nums text-[var(--text-secondary)]">
                                    {statusText}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Self view — smaller and tucked closer to the edge on phones,
                        kept clear of the control bar at every size. */}
                    {isVideoCall && (
                        <div
                            className="absolute bottom-28 right-3 h-28 w-20 overflow-hidden glass-strong sm:right-6 sm:h-40 sm:w-28 md:h-44 md:w-64"
                            style={{
                                borderRadius: "var(--radius-lg)",
                                boxShadow: "var(--shadow-lg)",
                            }}
                        >
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`h-full w-full -scale-x-100 object-cover ${
                                    isCameraOn ? "" : "opacity-0"
                                }`}
                            />
                            {!isCameraOn && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <VideoOff size={22} className="text-[var(--text-muted)]" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Controls */}
                    <footer className="absolute bottom-0 left-0 right-0 flex justify-center p-4 sm:p-6">
                        <div
                            /* `mb-safe` lifts the bar clear of the iOS home bar. */
                            className="mb-safe flex items-center gap-3 px-4 py-3 glass-strong sm:gap-4 sm:px-6 sm:py-4"
                            style={{
                                borderRadius: "var(--radius-full)",
                                boxShadow: "var(--shadow-lg)",
                            }}
                        >
                            {controlButton(
                                toggleMic,
                                isMicOn,
                                isMicOn ? "Mute microphone" : "Unmute microphone",
                                Mic,
                                MicOff
                            )}

                            {isVideoCall &&
                                controlButton(
                                    toggleCamera,
                                    isCameraOn,
                                    isCameraOn ? "Turn camera off" : "Turn camera on",
                                    Video,
                                    VideoOff
                                )}

                            <button
                                type="button"
                                onClick={hangUp}
                                title="End call"
                                aria-label="End call"
                                className="flex h-12 w-12 items-center justify-center rounded-full text-white transition-transform hover:scale-105 sm:h-14 sm:w-14"
                                style={{ background: "var(--color-error)" }}
                            >
                                <PhoneOff size={22} />
                            </button>
                        </div>
                    </footer>
                </>
            ) : (
                /* Ringing, dialling, and the terminal "call ended" card */
                <div
                    className="flex w-[calc(100%-2rem)] max-w-sm flex-col items-center gap-5 p-6 text-center animate-slide-up glass-card sm:gap-6 sm:p-10"
                    style={{
                        background: "var(--bg-elevated)",
                        boxShadow: "var(--shadow-lg)",
                    }}
                >
                    {avatar("sm", status !== "ended")}

                    <div className="min-w-0 max-w-full">
                        <h2 className="truncate text-lg font-semibold text-[var(--text-primary)] sm:text-xl">
                            {peerName}
                        </h2>
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">{statusText}</p>
                        {status === "calling" && (
                            <p className="mt-1 text-xs text-[var(--text-muted)]">
                                {isVideoCall ? "Video" : "Audio"} call
                            </p>
                        )}
                    </div>

                    {status === "ringing" && (
                        <div className="flex items-center gap-6 sm:gap-8">
                            <button
                                type="button"
                                onClick={declineCall}
                                title="Decline call"
                                aria-label="Decline call"
                                className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105 sm:h-16 sm:w-16"
                                style={{ background: "var(--color-error)" }}
                            >
                                <PhoneOff size={24} />
                            </button>
                            <button
                                type="button"
                                onClick={acceptCall}
                                title="Accept call"
                                aria-label="Accept call"
                                className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105 animate-pulse-glow sm:h-16 sm:w-16"
                                style={{ background: "var(--color-success)" }}
                            >
                                <Phone size={24} />
                            </button>
                        </div>
                    )}

                    {(status === "calling" || status === "ended") && (
                        <button
                            type="button"
                            onClick={hangUp}
                            disabled={status === "ended"}
                            className="flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100 sm:h-16 sm:w-16"
                            title={status === "ended" ? "Call ended" : "Cancel call"}
                            aria-label={status === "ended" ? "Call ended" : "Cancel call"}
                            style={{ background: "var(--color-error)" }}
                        >
                            <PhoneOff size={24} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default CallModal;
