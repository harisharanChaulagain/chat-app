"use client"
import React, { useState, useEffect } from 'react'
import Avatar from './ui/Avatar'
import Message from './Message'
import ChatBox from './ui/ChatBox'
import { Phone, Video } from 'lucide-react'
import useConversationStore from '@/store/useConversationStore'
import { useSocket } from '@/context/SocketContext'
import CallModal from './CallModal'

export default function MessageBox() {
    const { selectedConversation } = useConversationStore()
    const { onlineUsers, userMap, socket } = useSocket()
    const isOnline = selectedConversation ? onlineUsers.includes(selectedConversation._id) : false;
    const [callModalOpen, setCallModalOpen] = useState(false)
    const [callType, setCallType] = useState<'audio' | 'video'>('video')
    const [isIncomingCall, setIsIncomingCall] = useState(false)
    const [incomingCallInfo, setIncomingCallInfo] = useState<{
        from?: string;
        offer?: string;
        fromName?: string;
        callType?: 'audio' | 'video';
    } | null>(null)

    const receiverSocketId = selectedConversation ? userMap[selectedConversation._id] : "";

    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = (data: {
            from: string;
            offer: string;
            fromName: string;
            callType: 'audio' | 'video';
        }) => {
            setIncomingCallInfo({
                from: data.from,
                offer: data.offer,
                fromName: data.fromName,
                callType: data.callType
            });
            setIsIncomingCall(true);
            setCallModalOpen(true);
            setCallType(data.callType);
        };

        socket.on('incomingCall', handleIncomingCall);

        return () => {
            socket.off('incomingCall', handleIncomingCall);
        };
    }, [socket]);

    const handleCall = (type: 'audio' | 'video') => {
        setCallType(type)
        setCallModalOpen(true)
        setIsIncomingCall(false)
    }

    return (
        <main className='relative w-[70%] h-screen bg-slate-950 flex flex-col justify-between'>
            <header className="flex items-center justify-between px-6 py-4 space-x-4 text-white bg-slate-600">
                <section className='flex space-x-4'>
                    <Avatar src='https://i.pravatar.cc/150?img=4' isOnline={isOnline} size={48} />
                    <div>
                        <h1 className="font-semibold">{selectedConversation?.name}</h1>
                        <span className="text-sm text-slate-300">{isOnline ? "Online" : "Offline"}</span>
                    </div>
                </section>
                <section className='flex items-center gap-4'>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleCall('audio')}
                    >
                        <Phone />
                    </div>
                    <div
                        className='cursor-pointer'
                        onClick={() => handleCall('video')}
                    >
                        <Video />
                    </div>
                </section>
            </header>

            <section className="relative h-full">
                {!callModalOpen && <Message />}
            </section>

            <footer>
                <ChatBox />
            </footer>

            <CallModal
                userId={receiverSocketId}
                isOpen={callModalOpen}
                onClose={() => {
                    setCallModalOpen(false);
                    setIsIncomingCall(false);
                    setIncomingCallInfo(null);
                }}
                callType={callType}
                callerName={isIncomingCall ? incomingCallInfo?.fromName : selectedConversation?.name}
                isIncomingCall={isIncomingCall}
                incomingCallInfo={incomingCallInfo}
            />
        </main>
    )
}