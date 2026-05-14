'use client';

import { useSocket } from '@/context/SocketContext';
import React, { useEffect, useRef, useState } from 'react';

type CallType = 'video' | 'audio';

interface CallModalProps {
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    callType: CallType;
    callerName?: string;
    isIncomingCall?: boolean;
    incomingCallInfo?: {
        from?: string;
        fromName?: string;
        callType?: CallType;
        offer?: RTCSessionDescriptionInit;
    } | null;
}

const CallModal = ({
    userId,
    isOpen,
    onClose,
    callType,
    callerName,
    isIncomingCall = false,
    incomingCallInfo
}: CallModalProps) => {
    const { socket } = useSocket();
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const peerVideoRef = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<RTCPeerConnection | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [myId, setMyId] = useState('');
    const [isCallAccepted, setIsCallAccepted] = useState(false);
    const [isCallStarted, setIsCallStarted] = useState(false);

    const remoteStreamRef = useRef<MediaStream | null>(null);

    useEffect(() => {
        if (!isOpen) {
            endCall();
            return;
        }

        return () => {
            endCall();
        };
    }, [isOpen]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            remoteStreamRef.current = new MediaStream();
        }
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleConnect = () => {
            setMyId(socket?.id ?? "");
        };

        const handleCallAccepted = (answer: RTCSessionDescriptionInit) => {
            handleCallAcceptedResponse(answer);
        };

        const handleIceCandidate = (candidate: RTCIceCandidateInit) => {
            handleNewICECandidateMsg(candidate);
        };

        const handleCallEnded = () => {
            endCall();
            onClose();
        };

        socket.on('connect', handleConnect);
        socket.on('callAccepted', handleCallAccepted);
        socket.on('iceCandidate', handleIceCandidate);
        socket.on('callEnded', handleCallEnded);

        return () => {
            socket.off('connect', handleConnect);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('iceCandidate', handleIceCandidate);
            socket.off('callEnded', handleCallEnded);
        };
    }, [socket]);

    const createPeerConnection = () => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        if (stream) {
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
        }

        peerConnection.ontrack = (event) => {
            const remoteStream = event.streams[0];
            remoteStreamRef.current = remoteStream;

            const checkAndSetVideo = () => {
                if (peerVideoRef.current) {
                    peerVideoRef.current.srcObject = remoteStream;
                } else {
                    setTimeout(checkAndSetVideo, 100);
                }
            };
            checkAndSetVideo();
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit('iceCandidate', {
                    to: incomingCallInfo?.from || userId,
                    candidate: event.candidate,
                });
            }
        };

        return peerConnection;
    };

    const initiateCall = async () => {
        if (!userId || !socket) {
            alert('Please enter a user ID and ensure socket is connected');
            return;
        }

        try {
            const mediaConstraints = {
                video: callType === 'video',
                audio: true
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            setStream(mediaStream);

            const checkAndSetVideo = () => {
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = mediaStream;
                } else {
                    setTimeout(checkAndSetVideo, 100);
                }
            };
            checkAndSetVideo();

            connectionRef.current = createPeerConnection();
            const offer = await connectionRef.current.createOffer();
            await connectionRef.current.setLocalDescription(offer);

            socket.emit('initiateCall', {
                userId,
                offer,
                myId,
                callType,
                fromName: callerName || 'You'
            });

            setIsCallStarted(true);
        } catch (err) {
            console.error('Error initiating call:', err);
            endCall();
            onClose();
        }
    };

    useEffect(() => {
        if (isOpen && !isIncomingCall) {
            initiateCall();
        }
    }, [isOpen, isIncomingCall]);

    const handleCallAcceptedResponse = async (answer: RTCSessionDescriptionInit) => {
        if (!connectionRef.current) return;
        try {
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            setIsCallAccepted(true);
            setIsCallStarted(true);
        } catch (err) {
            console.error('Error setting remote description:', err);
        }
    };

    const handleNewICECandidateMsg = async (candidate: RTCIceCandidateInit) => {
        try {
            if (connectionRef.current) {
                await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
        } catch (err) {
            console.error('Error adding received ICE candidate:', err);
        }
    };

    const answerCall = async () => {
        try {
            const mediaConstraints = {
                video: incomingCallInfo?.callType === 'video',
                audio: true
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            setStream(mediaStream);

            const checkAndSetVideo = () => {
                if (myVideoRef.current) {
                    myVideoRef.current.srcObject = mediaStream;
                } else {
                    setTimeout(checkAndSetVideo, 100);
                }
            };
            checkAndSetVideo();

            connectionRef.current = createPeerConnection();

            // Set remote description from the incoming offer
            if (incomingCallInfo?.offer) {
                await connectionRef.current.setRemoteDescription(
                    new RTCSessionDescription(incomingCallInfo.offer)
                );
            }

            const answer = await connectionRef.current.createAnswer();
            await connectionRef.current.setLocalDescription(answer);

            socket?.emit('answerCall', {
                to: incomingCallInfo?.from,
                answer: answer,
            });

            setIsCallAccepted(true);
            setIsCallStarted(true);
        } catch (err) {
            console.error('Error answering call:', err);
            endCall();
            onClose();
        }
    };

    const endCall = () => {
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }

        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        if (remoteStreamRef.current) {
            remoteStreamRef.current.getTracks().forEach(track => track.stop());
            remoteStreamRef.current = null;
        }

        if (peerVideoRef.current) {
            peerVideoRef.current.srcObject = null;
        }

        if (myVideoRef.current) {
            myVideoRef.current.srcObject = null;
        }

        setIsCallAccepted(false);
        setIsCallStarted(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex flex-col items-center justify-center p-4">
            {isCallStarted ? (
                <>
                    <div className="relative w-full max-w-4xl h-[70vh] bg-gray-900 rounded-lg overflow-hidden">
                        {(incomingCallInfo?.callType === 'video' || callType === 'video') ? (
                            <>
                                <video
                                    ref={peerVideoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-4 right-4 w-40 h-28 border-2 border-white rounded overflow-hidden shadow-lg z-10">
                                    <video
                                        ref={myVideoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="bg-gray-700 rounded-full w-40 h-40 flex items-center justify-center">
                                    <span className="text-white text-4xl">
                                        {incomingCallInfo?.fromName?.[0] || callerName?.[0] || 'U'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={() => {
                                endCall();
                                onClose();
                                socket?.emit('endCall', { to: incomingCallInfo?.from || userId });
                            }}
                            className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
                        >
                            End Call
                        </button>
                    </div>
                </>
            ) : isIncomingCall ? (
                <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-2">
                        Incoming {incomingCallInfo?.callType === 'video' ? 'Video' : 'Audio'} Call
                    </h2>
                    <p className="text-gray-300 mb-6">from {incomingCallInfo?.fromName}</p>

                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={answerCall}
                            className="bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => {
                                endCall();
                                onClose();
                                socket?.emit('endCall', { to: incomingCallInfo?.from });
                            }}
                            className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
                        >
                            Decline
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        Calling {callerName}...
                    </h2>
                    <button
                        onClick={() => {
                            endCall();
                            onClose();
                            socket?.emit('endCall', { to: userId });
                        }}
                        className="bg-red-600 text-white px-6 py-3 rounded-full hover:bg-red-700 transition"
                    >
                        Cancel Call
                    </button>
                </div>
            )}
        </div>
    );
};

export default CallModal;