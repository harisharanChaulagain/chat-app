"use client"
import React, { useEffect } from 'react'
import Avatar from './ui/Avatar'
import Message from './Message'
import ChatBox from './ui/ChatBox'
import { MessageSquareMore, Phone, Video } from 'lucide-react'
import useConversationStore from '@/store/useConversationStore'
import { useSocket } from '@/context/SocketContext'
import { useCall } from '@/context/CallContext'

export default function ChatWindow() {
    const { selectedConversation, setTypingUser } = useConversationStore()
    const { onlineUsers, socket } = useSocket()
    const { startCall, status: callStatus } = useCall()
    const isOnline = selectedConversation ? onlineUsers.includes(selectedConversation._id) : false;
    const canCall = Boolean(selectedConversation) && isOnline && callStatus === 'idle'

    const handleCall = (callType: 'audio' | 'video') => {
        if (!selectedConversation) return;
        startCall(
            { _id: selectedConversation._id, name: selectedConversation.name },
            callType
        )
    }

    useEffect(() => {
        if (!socket) return;
        
        const handleTyping = (data: { userId?: string; isTyping?: boolean } | null) => {
            if (!data || typeof data !== "object") return;

            if (data.isTyping) {
                setTypingUser(data.userId ?? null);
            } else {
                setTypingUser(null);
            }
        };
        socket.on("userTyping", handleTyping);

        return () => {
            socket.off("userTyping", handleTyping);
        };
    }, [socket]);

    return (
        <>
            {selectedConversation ?
                < main className='relative w-[70%] h-screen bg-slate-950 flex flex-col justify-between'>
                    <header className="flex items-center justify-between px-6 py-4 space-x-4 text-white bg-slate-600">
                        <section className='flex space-x-4'>
                            <Avatar src='https://i.pravatar.cc/150?img=4' isOnline={isOnline} size={48} />
                            <div>
                                <h1 className="font-semibold">{selectedConversation?.name}</h1>
                                <span className="text-sm text-slate-300">{isOnline ? "Online" : "Offline"}</span>
                            </div>
                        </section>
                        <section className='flex items-center gap-2'>
                            <button
                                type='button'
                                onClick={() => handleCall('audio')}
                                disabled={!canCall}
                                title={isOnline ? 'Start audio call' : `${selectedConversation?.name} is offline`}
                                aria-label='Start audio call'
                                className='p-2 rounded-full hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer'
                            >
                                <Phone size={20} />
                            </button>
                            <button
                                type='button'
                                onClick={() => handleCall('video')}
                                disabled={!canCall}
                                title={isOnline ? 'Start video call' : `${selectedConversation?.name} is offline`}
                                aria-label='Start video call'
                                className='p-2 rounded-full hover:bg-slate-700 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent cursor-pointer'
                            >
                                <Video size={20} />
                            </button>
                        </section>
                    </header>

                    <section className="relative h-full">
                        <Message />
                    </section>

                    <footer>
                        <ChatBox />
                    </footer>

                </ main> :
                <div className="w-[70%] h-screen bg-slate-950 flex items-center justify-center border-l border-slate-800">
                    <div className="flex flex-col items-center">
                        <MessageSquareMore
                            size={90}
                            className="text-slate-700 mb-6"
                        />

                        <h1 className="text-3xl font-semibold text-white">
                            Welcome to Chat
                        </h1>

                        <p className="mt-3 text-slate-400 text-center max-w-sm">
                            Select a conversation from the left panel to start messaging.
                        </p>
                    </div>
                </div>
            }
        </>
    )
}