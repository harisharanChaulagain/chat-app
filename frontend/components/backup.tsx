

"use client"
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://backend:5000');

function MessageBox() {
    const myVideoRef = useRef<HTMLVideoElement>(null);
    const peerVideoRef = useRef<HTMLVideoElement>(null);
    const connectionRef = useRef<RTCPeerConnection | null>(null);
    const remoteStreamRef = useRef<MediaStream | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [userId, setUserId] = useState('');
    const [myId, setMyId] = useState<string | undefined>();
    const [incomingCallInfo, setIncomingCallInfo] = useState<{
        isSomeoneCalling?: boolean;
        from?: string;
        offer?: RTCSessionDescriptionInit;
    }>({});
    const [isCallAccepted, setIsCallAccepted] = useState(false);

    useEffect(() => {
        remoteStreamRef.current = new MediaStream();

        navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
            .then(mediaStream => {
                setStream(mediaStream);
                if (myVideoRef.current) myVideoRef.current.srcObject = mediaStream;
            })
            .catch(err => console.error('Failed to get media devices:', err));

        socket.on('connect', () => {
            setMyId(socket.id);
        });

        socket.on('incomingCall', (data) => {
            handleIncomingCall(data);
        });

        socket.on('callAccepted', (answer) => {
            handleCallAccepted(answer);
        });

        socket.on('iceCandidate', (candidate) => {
            handleNewICECandidateMsg(candidate);
        });

        socket.on('callEnded', () => {
            endCall();
        });

        return () => {
            socket.off('incomingCall', handleIncomingCall);
            socket.off('callAccepted', handleCallAccepted);
            socket.off('iceCandidate', handleNewICECandidateMsg);
            socket.off('callEnded', endCall);
            socket.off('connect');
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const createPeerConnection = () => {
        const peerConnection = new RTCPeerConnection({
            iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        if (stream) {
            stream.getTracks().forEach(track => {
                peerConnection.addTrack(track, stream);
            });
        } else {
            console.warn('No local stream available to add tracks!');
        }

        peerConnection.ontrack = (event) => {
            console.log('Received remote track:', event.track.kind);
            if (peerVideoRef.current) {
                peerVideoRef.current.srcObject = event.streams[0];
                console.log('Assigned remote stream to peer video:', peerVideoRef.current.srcObject);
            }
        };

        peerConnection.onicecandidate = (event) => {
            if (event.candidate) {
                socket.emit('iceCandidate', {
                    to: incomingCallInfo.from || userId,
                    candidate: event.candidate,
                });
            }
        };

        peerConnection.onconnectionstatechange = () => {
            console.log('Connection state change:', peerConnection.connectionState);
        };

        peerConnection.oniceconnectionstatechange = () => {
            console.log('ICE connection state change:', peerConnection.iceConnectionState);
        };

        return peerConnection;
    };

    const initiateCall = async () => {
        if (!userId) {
            alert('Please enter a user ID to call');
            return;
        }
        connectionRef.current = createPeerConnection();

        try {
            const offer = await connectionRef.current.createOffer();
            await connectionRef.current.setLocalDescription(offer);

            socket.emit('initiateCall', {
                userId,
                offer,
                myId,
            });
        } catch (err) {
            console.error('Error creating or sending offer:', err);
        }
    };

    const handleCallAccepted = async (answer: RTCSessionDescriptionInit) => {
        if (!connectionRef.current) {
            console.warn('No RTCPeerConnection exists on callAccepted');
            return;
        }
        try {
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
            setIsCallAccepted(true);
        } catch (err) {
            console.error('Error setting remote description:', err);
        }
    };

    const handleIncomingCall = ({ from, offer }: { from: string, offer: RTCSessionDescriptionInit }) => {
        setIncomingCallInfo({ isSomeoneCalling: true, from, offer });
    };

    const handleNewICECandidateMsg = async (candidate: RTCIceCandidateInit) => {
        try {
            if (connectionRef.current) {
                await connectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            } else {
                console.warn('No peer connection to add ICE candidate to');
            }
        } catch (err) {
            console.error('Error adding received ICE candidate:', err);
        }
    };

    const answerCall = async () => {
        if (!incomingCallInfo.offer || !incomingCallInfo.from) {
            console.warn('Call offer or caller info is missing');
            return;
        }
        console.log("hello check")
        setIsCallAccepted(true);
        connectionRef.current = createPeerConnection();

        try {
            await connectionRef.current.setRemoteDescription(new RTCSessionDescription(incomingCallInfo.offer));
            const answer = await connectionRef.current.createAnswer();
            await connectionRef.current.setLocalDescription(answer);

            socket.emit('answerCall', {
                to: incomingCallInfo.from,
                answer,
            });
            setIncomingCallInfo({});
        } catch (err) {
            console.error('Error answering call:', err);
        }
    };

    const endCall = () => {
        if (connectionRef.current) {
            connectionRef.current.close();
            connectionRef.current = null;
        }
        remoteStreamRef.current = new MediaStream();
        if (peerVideoRef.current) {
            peerVideoRef.current.srcObject = null;
        }
        setIsCallAccepted(false);
        setIncomingCallInfo({});
        socket.emit('endCall', { to: incomingCallInfo.from || userId });
    };

    return (
        <div className="flex flex-col items-center">
            <h2 className='text-center'>Video Calling MERN App</h2>
            <div className='flex flex-col w-300 gap-4'>
                <input type="text" value={userId} onChange={e => setUserId(e.target.value)} placeholder="Enter User ID" className='input' />
                <button onClick={initiateCall} className='input bg-blue'>Call User</button>
                {isCallAccepted && <button onClick={endCall} className='input bg-red'>End Call</button>}
            </div>
            <section className='m-4'>My ID: <u><i>{myId}</i></u></section>
            <div className='flex flex-row gap-4 m-4 mb-8'>
                <div>
                    <h3 className='text-center'>My Video</h3>
                    <video ref={myVideoRef} autoPlay playsInline muted className='video_player' />
                </div>
                <div>
                    <h3 className='text-center'>Peer Video</h3>
                    <video ref={peerVideoRef} autoPlay playsInline className='video_player' />
                </div>
            </div>
            {incomingCallInfo.isSomeoneCalling && !isCallAccepted && (
                <div className='flex flex-col mb-8'>
                    <section className='m-4'><u>{incomingCallInfo.from}</u> is calling</section>
                    <button onClick={answerCall} className='input bg-green'>Answer Call</button>
                </div>
            )}
        </div>
    );
}

export default MessageBox;
