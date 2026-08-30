"use client"
import React, { useEffect } from 'react'
import Avatar from './ui/Avatar'
import Message from './Message'
import ChatBox from './ui/ChatBox'
import { ArrowLeft, MessageSquareMore, Phone, Video } from 'lucide-react'
import useConversationStore from '@/store/useConversationStore'
import { useSocket } from '@/context/SocketContext'
import { useCall } from '@/context/CallContext'

export default function ChatWindow() {
    const { selectedConversation, setSelectedConversation, setTypingUser } = useConversationStore()
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

    /* Mobile: only rendered while a thread is open (it replaces the list).
       Tablet and up: always visible, showing the empty state when idle. */
    const paneClasses = `h-full min-h-0 min-w-0 flex-1 flex-col bg-slate-950 md:flex ${
        selectedConversation ? 'flex' : 'hidden'
    }`

    if (!selectedConversation) {
        return (
            <div className={`${paneClasses} items-center justify-center border-l border-slate-800 p-6`}>
                <div className="flex flex-col items-center text-center">
                    <MessageSquareMore
                        className="mb-5 h-16 w-16 text-slate-700 sm:mb-6 sm:h-[90px] sm:w-[90px]"
                    />

                    <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                        Welcome to Chat
                    </h1>

                    <p className="mt-3 max-w-sm text-sm text-slate-400 sm:text-base">
                        Select a conversation from the left panel to start messaging.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <main className={`relative ${paneClasses}`}>
            <header className="flex flex-shrink-0 items-center justify-between gap-2 bg-slate-600 px-3 py-3 text-white sm:px-6 sm:py-4">
                <section className='flex min-w-0 flex-1 items-center gap-2 sm:gap-4'>
                    {/* Back to the list — mobile only, where the panes swap */}
                    <button
                        type='button'
                        onClick={() => setSelectedConversation(null)}
                        aria-label='Back to chats'
                        className='-ml-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition hover:bg-slate-700 md:hidden'
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <Avatar src='https://i.pravatar.cc/150?img=4' isOnline={isOnline} size={40} />
                    <div className="min-w-0">
                        <h1 className="truncate font-semibold">{selectedConversation?.name}</h1>
                        <span className="block truncate text-xs text-slate-300 sm:text-sm">
                            {isOnline ? "Online" : "Offline"}
                        </span>
                    </div>
                </section>

                <section className='flex flex-shrink-0 items-center gap-1 sm:gap-2'>
                    <button
                        type='button'
                        onClick={() => handleCall('audio')}
                        disabled={!canCall}
                        title={isOnline ? 'Start audio call' : `${selectedConversation?.name} is offline`}
                        aria-label='Start audio call'
                        className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
                    >
                        <Phone size={20} />
                    </button>
                    <button
                        type='button'
                        onClick={() => handleCall('video')}
                        disabled={!canCall}
                        title={isOnline ? 'Start video call' : `${selectedConversation?.name} is offline`}
                        aria-label='Start video call'
                        className='flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent'
                    >
                        <Video size={20} />
                    </button>
                </section>
            </header>

            {/* min-h-0 lets the scroll area shrink instead of pushing the composer
                off-screen — the old fixed `calc(100vh - 150px)` cap drifted
                whenever the header or composer changed height. */}
            <Message />

            {/* `pb-safe` sits on the wrapper rather than the composer itself, so
                the iOS home-bar strip is filled with the composer's background
                instead of eating its padding. */}
            <footer className="flex-shrink-0 bg-slate-900 pb-safe">
                <ChatBox />
            </footer>
        </main>
    )
}
