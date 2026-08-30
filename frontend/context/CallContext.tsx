"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import toast from "react-hot-toast";
import { useSocket } from "./SocketContext";
import { useUserStore } from "@/store/userStore";
import {
    CallAcceptedPayload,
    CallClosedPayload,
    CallEndReason,
    CallPeer,
    CallStatus,
    CallType,
    CALL_END_MESSAGES,
    IceCandidatePayload,
    IncomingCallPayload,
} from "@/types/call";

/**
 * STUN alone is enough for most home networks. Symmetric NATs and corporate
 * firewalls need a TURN relay — set NEXT_PUBLIC_TURN_URLS to enable one.
 */
const buildIceServers = (): RTCIceServer[] => {
    const stun = (
        process.env.NEXT_PUBLIC_STUN_URLS ||
        "stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302"
    )
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

    const servers: RTCIceServer[] = [{ urls: stun }];

    const turn = (process.env.NEXT_PUBLIC_TURN_URLS || "")
        .split(",")
        .map((url) => url.trim())
        .filter(Boolean);

    if (turn.length) {
        servers.push({
            urls: turn,
            username: process.env.NEXT_PUBLIC_TURN_USERNAME,
            credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL,
        });
    }

    return servers;
};

/** How long the "Call ended — <reason>" card stays up before the modal closes. */
const ENDED_LINGER_MS = 1800;

type CallState = {
    status: CallStatus;
    callType: CallType;
    peerId: string | null;
    peerName: string;
    isOutgoing: boolean;
    endReason: CallEndReason | null;
};

const IDLE_STATE: CallState = {
    status: "idle",
    callType: "video",
    peerId: null,
    peerName: "",
    isOutgoing: false,
    endReason: null,
};

type CallContextType = CallState & {
    localStream: MediaStream | null;
    remoteStream: MediaStream | null;
    isMicOn: boolean;
    isCameraOn: boolean;
    /** Seconds since the peer connection reached "connected". */
    duration: number;
    startCall: (peer: CallPeer, callType: CallType) => void;
    acceptCall: () => void;
    declineCall: () => void;
    hangUp: () => void;
    toggleMic: () => void;
    toggleCamera: () => void;
};

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
    const { socket, onlineUsers } = useSocket();
    const { user } = useUserStore();

    const [state, setState] = useState<CallState>(IDLE_STATE);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(true);
    const [duration, setDuration] = useState(0);

    // Socket handlers run outside React's render cycle, so every value they read
    // lives in a ref that is written synchronously.
    const stateRef = useRef<CallState>(IDLE_STATE);
    const pcRef = useRef<RTCPeerConnection | null>(null);
    const localStreamRef = useRef<MediaStream | null>(null);
    const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);
    const pendingCandidatesRef = useRef<RTCIceCandidateInit[]>([]);
    const ringtoneRef = useRef<HTMLAudioElement | null>(null);
    const durationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const patchState = useCallback((patch: Partial<CallState>) => {
        stateRef.current = { ...stateRef.current, ...patch };
        setState(stateRef.current);
    }, []);

    /* ------------------------------------------------------------------ *
     * Ring tones
     * ------------------------------------------------------------------ */

    const stopTone = useCallback(() => {
        const tone = ringtoneRef.current;
        if (!tone) return;
        tone.pause();
        tone.currentTime = 0;
        ringtoneRef.current = null;
    }, []);

    const playTone = useCallback(
        (src: string) => {
            stopTone();
            const tone = new Audio(src);
            tone.loop = true;
            tone.volume = 0.6;
            ringtoneRef.current = tone;
            // Autoplay can be blocked until the page has been interacted with —
            // a silent ring is better than a thrown error.
            void tone.play().catch(() => undefined);
        },
        [stopTone]
    );

    /* ------------------------------------------------------------------ *
     * Teardown
     * ------------------------------------------------------------------ */

    const releaseMedia = useCallback(() => {
        const pc = pcRef.current;
        if (pc) {
            pc.onicecandidate = null;
            pc.ontrack = null;
            pc.onconnectionstatechange = null;
            pc.close();
            pcRef.current = null;
        }

        localStreamRef.current?.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;

        setLocalStream(null);
        setRemoteStream(null);
        pendingOfferRef.current = null;
        pendingCandidatesRef.current = [];

        if (durationTimerRef.current) {
            clearInterval(durationTimerRef.current);
            durationTimerRef.current = null;
        }
    }, []);

    const resetToIdle = useCallback(() => {
        if (lingerTimerRef.current) {
            clearTimeout(lingerTimerRef.current);
            lingerTimerRef.current = null;
        }
        stateRef.current = IDLE_STATE;
        setState(IDLE_STATE);
        setDuration(0);
        setIsMicOn(true);
        setIsCameraOn(true);
    }, []);

    /** Closes the call locally and shows why, without signalling the peer. */
    const finishCall = useCallback(
        (reason: CallEndReason) => {
            const { status } = stateRef.current;
            // "ended" is already terminal — a late signal must not restart the linger.
            if (status === "idle" || status === "ended") return;

            stopTone();
            releaseMedia();
            patchState({ status: "ended", endReason: reason });

            if (lingerTimerRef.current) clearTimeout(lingerTimerRef.current);
            lingerTimerRef.current = setTimeout(resetToIdle, ENDED_LINGER_MS);
        },
        [patchState, releaseMedia, resetToIdle, stopTone]
    );

    /* ------------------------------------------------------------------ *
     * Peer connection
     * ------------------------------------------------------------------ */

    const startDurationTimer = useCallback(() => {
        if (durationTimerRef.current) return;
        setDuration(0);
        durationTimerRef.current = setInterval(() => {
            setDuration((seconds) => seconds + 1);
        }, 1000);
    }, []);

    const createPeerConnection = useCallback(
        (peerId: string, stream: MediaStream) => {
            const pc = new RTCPeerConnection({ iceServers: buildIceServers() });

            stream.getTracks().forEach((track) => pc.addTrack(track, stream));

            pc.onicecandidate = (event) => {
                if (event.candidate) {
                    socket?.emit("iceCandidate", {
                        to: peerId,
                        candidate: event.candidate.toJSON(),
                    });
                }
            };

            pc.ontrack = (event) => {
                const [inboundStream] = event.streams;
                if (inboundStream) setRemoteStream(inboundStream);
            };

            pc.onconnectionstatechange = () => {
                switch (pc.connectionState) {
                    case "connected":
                        stopTone();
                        patchState({ status: "connected" });
                        startDurationTimer();
                        break;
                    case "failed":
                        finishCall("failed");
                        break;
                    case "disconnected":
                        // Brief ICE hiccups recover on their own; only give up if
                        // the connection is still down a few seconds later.
                        setTimeout(() => {
                            if (pcRef.current === pc && pc.connectionState === "disconnected") {
                                finishCall("disconnected");
                            }
                        }, 5000);
                        break;
                    default:
                        break;
                }
            };

            pcRef.current = pc;
            return pc;
        },
        [finishCall, patchState, socket, startDurationTimer, stopTone]
    );

    /** ICE can arrive before the remote description exists — replay it after. */
    const drainPendingCandidates = useCallback(async () => {
        const pc = pcRef.current;
        if (!pc) return;

        const candidates = pendingCandidatesRef.current;
        pendingCandidatesRef.current = [];

        for (const candidate of candidates) {
            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Failed to add buffered ICE candidate", error);
            }
        }
    }, []);

    const requestMedia = useCallback(async (callType: CallType) => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video:
                callType === "video"
                    ? { width: { ideal: 1280 }, height: { ideal: 720 } }
                    : false,
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setIsMicOn(true);
        setIsCameraOn(callType === "video");
        return stream;
    }, []);

    /* ------------------------------------------------------------------ *
     * Outgoing calls
     * ------------------------------------------------------------------ */

    const startCall = useCallback(
        async (peer: CallPeer, callType: CallType) => {
            if (!socket) {
                toast.error("Not connected to the server");
                return;
            }
            if (stateRef.current.status !== "idle") {
                toast.error("You are already in a call");
                return;
            }
            if (!onlineUsers.includes(peer._id)) {
                toast.error(`${peer.name} is offline`);
                return;
            }

            patchState({
                status: "calling",
                callType,
                peerId: peer._id,
                peerName: peer.name,
                isOutgoing: true,
                endReason: null,
            });

            let stream: MediaStream;
            try {
                stream = await requestMedia(callType);
            } catch (error) {
                console.error("Could not access microphone/camera", error);
                toast.error("Allow camera and microphone access to make a call");
                finishCall("media-denied");
                return;
            }

            try {
                const pc = createPeerConnection(peer._id, stream);
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);

                socket.emit("initiateCall", {
                    userId: peer._id,
                    offer,
                    callType,
                    fromName: user?.name ?? "Unknown",
                });

                playTone("/call_outgoing_sound.mp3");
            } catch (error) {
                console.error("Could not start the call", error);
                finishCall("failed");
            }
        },
        [
            createPeerConnection,
            finishCall,
            onlineUsers,
            patchState,
            playTone,
            requestMedia,
            socket,
            user?.name,
        ]
    );

    /* ------------------------------------------------------------------ *
     * Incoming calls
     * ------------------------------------------------------------------ */

    const acceptCall = useCallback(async () => {
        const { status, peerId, callType } = stateRef.current;
        const offer = pendingOfferRef.current;

        if (status !== "ringing" || !peerId || !offer || !socket) return;

        stopTone();
        patchState({ status: "connecting" });

        let stream: MediaStream;
        try {
            stream = await requestMedia(callType);
        } catch (error) {
            console.error("Could not access microphone/camera", error);
            toast.error("Allow camera and microphone access to answer");
            socket.emit("rejectCall", { to: peerId, callType, reason: "media-denied" });
            finishCall("media-denied");
            return;
        }

        try {
            const pc = createPeerConnection(peerId, stream);
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            await drainPendingCandidates();

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);

            socket.emit("answerCall", { to: peerId, answer, callType });
        } catch (error) {
            console.error("Could not answer the call", error);
            finishCall("failed");
        }
    }, [
        createPeerConnection,
        drainPendingCandidates,
        finishCall,
        patchState,
        requestMedia,
        socket,
        stopTone,
    ]);

    const declineCall = useCallback(() => {
        const { peerId, callType } = stateRef.current;
        if (peerId) socket?.emit("rejectCall", { to: peerId, callType, reason: "rejected" });
        finishCall("rejected");
    }, [finishCall, socket]);

    const hangUp = useCallback(() => {
        const { peerId, status, callType } = stateRef.current;
        if (peerId) {
            socket?.emit("endCall", {
                to: peerId,
                callType,
                reason: status === "calling" ? "cancelled" : "hangup",
            });
        }
        finishCall(status === "calling" ? "cancelled" : "hangup");
    }, [finishCall, socket]);

    /* ------------------------------------------------------------------ *
     * Local track controls
     * ------------------------------------------------------------------ */

    const toggleMic = useCallback(() => {
        const tracks = localStreamRef.current?.getAudioTracks() ?? [];
        if (!tracks.length) return;
        const enabled = !tracks[0].enabled;
        tracks.forEach((track) => {
            track.enabled = enabled;
        });
        setIsMicOn(enabled);
    }, []);

    const toggleCamera = useCallback(() => {
        const tracks = localStreamRef.current?.getVideoTracks() ?? [];
        if (!tracks.length) return;
        const enabled = !tracks[0].enabled;
        tracks.forEach((track) => {
            track.enabled = enabled;
        });
        setIsCameraOn(enabled);
    }, []);

    /* ------------------------------------------------------------------ *
     * Signalling
     * ------------------------------------------------------------------ */

    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = (data: IncomingCallPayload) => {
            // Already busy: decline immediately so the caller isn't left ringing.
            if (stateRef.current.status !== "idle") {
                socket.emit("rejectCall", {
                    to: data.from,
                    callType: data.callType,
                    reason: "busy",
                });
                return;
            }

            pendingOfferRef.current = data.offer;
            pendingCandidatesRef.current = [];
            patchState({
                status: "ringing",
                callType: data.callType,
                peerId: data.from,
                peerName: data.fromName || "Unknown caller",
                isOutgoing: false,
                endReason: null,
            });
            playTone("/call_incoming_sound.mp3");
        };

        const handleCallAccepted = async ({ from, answer }: CallAcceptedPayload) => {
            if (stateRef.current.peerId !== from || !pcRef.current) return;

            stopTone();
            patchState({ status: "connecting" });
            try {
                await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
                await drainPendingCandidates();
            } catch (error) {
                console.error("Could not apply the remote answer", error);
                finishCall("failed");
            }
        };

        const handleIceCandidate = async ({ from, candidate }: IceCandidatePayload) => {
            if (stateRef.current.peerId !== from || !candidate) return;

            const pc = pcRef.current;
            if (!pc || !pc.remoteDescription) {
                pendingCandidatesRef.current.push(candidate);
                return;
            }

            try {
                await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (error) {
                console.error("Failed to add ICE candidate", error);
            }
        };

        const handleCallClosed = ({ from, reason }: CallClosedPayload) => {
            if (stateRef.current.peerId !== from) return;
            if (stateRef.current.status === "idle" || stateRef.current.status === "ended") return;
            if (reason === "busy" || reason === "offline") {
                toast.error(CALL_END_MESSAGES[reason]);
            }
            finishCall(reason ?? "hangup");
        };

        const handleCallError = ({ message }: { message?: string }) => {
            toast.error(message || "Call failed");
        };

        socket.on("incomingCall", handleIncomingCall);
        socket.on("callAccepted", handleCallAccepted);
        socket.on("iceCandidate", handleIceCandidate);
        socket.on("callRejected", handleCallClosed);
        socket.on("callEnded", handleCallClosed);
        socket.on("call_error", handleCallError);

        return () => {
            socket.off("incomingCall", handleIncomingCall);
            socket.off("callAccepted", handleCallAccepted);
            socket.off("iceCandidate", handleIceCandidate);
            socket.off("callRejected", handleCallClosed);
            socket.off("callEnded", handleCallClosed);
            socket.off("call_error", handleCallError);
        };
    }, [drainPendingCandidates, finishCall, patchState, playTone, socket, stopTone]);

    /** Let the peer know instead of leaving them staring at a frozen frame. */
    useEffect(() => {
        const handleUnload = () => {
            const { peerId, status } = stateRef.current;
            if (peerId && status !== "idle" && status !== "ended") {
                socket?.emit("endCall", { to: peerId, reason: "hangup" });
            }
        };

        window.addEventListener("beforeunload", handleUnload);
        return () => window.removeEventListener("beforeunload", handleUnload);
    }, [socket]);

    useEffect(
        () => () => {
            stopTone();
            releaseMedia();
            if (lingerTimerRef.current) clearTimeout(lingerTimerRef.current);
        },
        [releaseMedia, stopTone]
    );

    const value = useMemo<CallContextType>(
        () => ({
            ...state,
            localStream,
            remoteStream,
            isMicOn,
            isCameraOn,
            duration,
            startCall: (peer, callType) => void startCall(peer, callType),
            acceptCall: () => void acceptCall(),
            declineCall,
            hangUp,
            toggleMic,
            toggleCamera,
        }),
        [
            acceptCall,
            declineCall,
            duration,
            hangUp,
            isCameraOn,
            isMicOn,
            localStream,
            remoteStream,
            startCall,
            state,
            toggleCamera,
            toggleMic,
        ]
    );

    return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};

export const useCall = () => {
    const context = useContext(CallContext);
    if (!context) throw new Error("useCall must be used inside a CallProvider");
    return context;
};
