"use client";

import React, { useEffect, useRef } from "react";
import clsx from "clsx";
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

/**
 * Full-screen call surface.
 *
 * Two visual modes share one control language:
 *  • video — the remote feed goes full-bleed on a black stage, so every
 *    chrome element (header pill, self-view, control bar) is glass-on-dark.
 *  • audio — no feed to show, so the stage becomes a soft brand wash that
 *    tracks the app theme, and the controls use surface tokens.
 */
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
    // True once the remote feed is actually painting — that is the only time
    // the chrome sits on video rather than on the themed stage.
    const onVideoStage = isLive && isVideoCall && Boolean(remoteStream);

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

    /** Brand-gradient initials disc with an optional ringing halo. */
    const avatar = (size: "lg" | "sm", pulse = false) => (
        <div className="relative flex items-center justify-center">
            {pulse && (
                <>
                    {/* Two offset halos read as a slow radar sweep. */}
                    <span
                        aria-hidden="true"
                        className="absolute h-full w-full rounded-full bg-[var(--primary)]/25 animate-call-ring"
                    />
                    <span
                        aria-hidden="true"
                        className="absolute h-full w-full rounded-full bg-[var(--primary)]/20 animate-call-ring"
                        style={{ animationDelay: "0.9s" }}
                    />
                </>
            )}
            <div
                className={clsx(
                    "relative flex items-center justify-center rounded-full font-semibold text-white",
                    size === "lg"
                        ? "h-28 w-28 text-5xl sm:h-32 sm:w-32"
                        : "h-24 w-24 text-4xl"
                )}
                style={{
                    background: "var(--gradient-brand)",
                    boxShadow: "var(--shadow-brand)",
                }}
            >
                {getInitials(peerName)}
            </div>
        </div>
    );

    /**
     * Toggle control. `active` means the device is ON — the "off" state gets a
     * solid fill so a muted mic is unmistakable at a glance.
     */
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
            className={clsx(
                "flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95 sm:h-14 sm:w-14",
                onVideoStage
                    ? active
                        ? "border-white/20 bg-white/12 text-white hover:bg-white/20"
                        : "border-transparent bg-white text-[#171923]"
                    : active
                        ? "border-[var(--border)] bg-[var(--surface)] text-[var(--text)] shadow-[var(--shadow-sm)] hover:bg-[var(--surface-2)]"
                        : "border-transparent bg-[var(--text)] text-[var(--surface)]"
            )}
        >
            {active ? <ActiveIcon size={21} /> : <InactiveIcon size={21} />}
        </button>
    );

    const endCallButton = () => (
        <button
            type="button"
            onClick={hangUp}
            title="End call"
            aria-label="End call"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-[0_6px_18px_rgba(239,68,68,0.35)] transition-all duration-200 hover:bg-[var(--danger-hover)] hover:scale-105 active:scale-95 sm:h-14 sm:w-14"
        >
            <PhoneOff size={21} />
        </button>
    );

    return (
        <div
            className={clsx(
                "fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fade-in",
                onVideoStage ? "bg-black" : "call-stage"
            )}
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
                    {/* Caller identity. Only needed once the remote video has
                        taken the screen — otherwise the centred block below is
                        already showing the same name and status. */}
                    {onVideoStage && (
                        <header className="absolute left-0 right-0 top-0 flex justify-center p-4 sm:justify-start sm:p-6">
                            <div className="flex min-w-0 max-w-full items-center gap-2.5 rounded-full border border-white/15 bg-black/45 px-4 py-2 text-white backdrop-blur-xl sm:gap-3">
                                {status === "connected" && (
                                    <span
                                        aria-hidden="true"
                                        className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--success)] animate-pulse-glow"
                                    />
                                )}
                                <span className="truncate text-sm font-semibold">
                                    {peerName}
                                </span>
                                <span className="flex-shrink-0 text-xs tabular-nums text-white/65">
                                    {statusText}
                                </span>
                            </div>
                        </header>
                    )}

                    {/* Audio-only calls, or video that has not arrived yet */}
                    {(!isVideoCall || !remoteStream) && (
                        <div className="flex flex-col items-center gap-6 px-6">
                            {avatar("lg", status === "connecting")}
                            <div className="max-w-full text-center">
                                <h2 className="truncate text-2xl font-bold tracking-tight text-[var(--text)]">
                                    {peerName}
                                </h2>
                                <p className="mt-1.5 text-sm tabular-nums text-[var(--muted)]">
                                    {statusText}
                                </p>
                                {isVideoCall && (
                                    <p className="mt-1 text-xs text-[var(--muted-2)]">
                                        Waiting for their video…
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Self view — smaller and tucked closer to the edge on phones,
                        kept clear of the control bar at every size. */}
                    {isVideoCall && (
                        <div
                            className={clsx(
                                "absolute bottom-28 right-3 overflow-hidden rounded-[var(--radius-lg)] border shadow-[var(--shadow-lg)] sm:right-6 sm:bottom-32",
                                "h-28 w-20 sm:h-40 sm:w-28 md:h-44 md:w-64",
                                onVideoStage
                                    ? "border-white/15 bg-black/70"
                                    : "border-[var(--border)] bg-[var(--surface-2)]"
                            )}
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
                                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                                    <VideoOff
                                        size={20}
                                        className={onVideoStage ? "text-white/50" : "text-[var(--muted-2)]"}
                                    />
                                    <span
                                        className={clsx(
                                            "hidden text-[10px] font-medium sm:block",
                                            onVideoStage ? "text-white/50" : "text-[var(--muted-2)]"
                                        )}
                                    >
                                        Camera off
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Controls */}
                    <footer className="absolute bottom-0 left-0 right-0 flex justify-center p-4 sm:p-6">
                        <div
                            /* `mb-safe` lifts the bar clear of the iOS home bar. */
                            className={clsx(
                                "mb-safe flex items-center gap-3 rounded-full border px-4 py-3 backdrop-blur-xl sm:gap-4 sm:px-5",
                                onVideoStage
                                    ? "border-white/12 bg-black/45"
                                    : "border-[var(--border)] bg-[var(--overlay-surface)] shadow-[var(--shadow-lg)]"
                            )}
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

                            {endCallButton()}
                        </div>
                    </footer>
                </>
            ) : (
                /* Ringing, dialling, and the terminal "call ended" card */
                <div
                    className="flex w-[calc(100%-2rem)] max-w-sm flex-col items-center gap-6 rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] p-7 text-center shadow-[var(--shadow-lg)] animate-slide-up sm:p-9"
                >
                    <div className="flex flex-col items-center gap-5">
                        {avatar("sm", status !== "ended")}

                        <div className="min-w-0 max-w-full">
                            <h2 className="truncate text-xl font-bold tracking-tight text-[var(--text)]">
                                {peerName}
                            </h2>
                            <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-[var(--muted)]">
                                {status !== "ended" && (
                                    <span
                                        aria-hidden="true"
                                        className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--primary-soft-strong)] text-[var(--primary)]"
                                    >
                                        {callType === "video" ? (
                                            <Video size={11} />
                                        ) : (
                                            <Phone size={11} />
                                        )}
                                    </span>
                                )}
                                {statusText}
                            </p>
                            {status === "calling" && (
                                <p className="mt-1 text-xs text-[var(--muted-2)]">
                                    {isVideoCall ? "Video" : "Audio"} call
                                </p>
                            )}
                        </div>
                    </div>

                    {status === "ringing" && (
                        <div className="flex items-start justify-center gap-10 sm:gap-12">
                            <div className="flex flex-col items-center gap-2">
                                <button
                                    type="button"
                                    onClick={declineCall}
                                    title="Decline call"
                                    aria-label="Decline call"
                                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-[0_6px_18px_rgba(239,68,68,0.35)] transition-all duration-200 hover:bg-[var(--danger-hover)] hover:scale-105 active:scale-95"
                                >
                                    <PhoneOff size={24} />
                                </button>
                                <span className="text-xs font-medium text-[var(--muted)]">
                                    Decline
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-2">
                                <button
                                    type="button"
                                    onClick={acceptCall}
                                    title="Accept call"
                                    aria-label="Accept call"
                                    className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)] text-white shadow-[0_6px_18px_rgba(34,197,94,0.35)] transition-all duration-200 hover:scale-105 active:scale-95 animate-pulse-glow"
                                >
                                    {callType === "video" ? (
                                        <Video size={24} />
                                    ) : (
                                        <Phone size={24} />
                                    )}
                                </button>
                                <span className="text-xs font-medium text-[var(--muted)]">
                                    Accept
                                </span>
                            </div>
                        </div>
                    )}

                    {(status === "calling" || status === "ended") && (
                        <div className="flex flex-col items-center gap-2">
                            <button
                                type="button"
                                onClick={hangUp}
                                disabled={status === "ended"}
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--danger)] text-white shadow-[0_6px_18px_rgba(239,68,68,0.35)] transition-all duration-200 hover:bg-[var(--danger-hover)] hover:scale-105 active:scale-95 disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100"
                                title={status === "ended" ? "Call ended" : "Cancel call"}
                                aria-label={status === "ended" ? "Call ended" : "Cancel call"}
                            >
                                <PhoneOff size={24} />
                            </button>
                            <span className="text-xs font-medium text-[var(--muted)]">
                                {status === "ended" ? "Ended" : "Cancel"}
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CallModal;
