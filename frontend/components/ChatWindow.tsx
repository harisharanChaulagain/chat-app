"use client"
import React, { useEffect } from 'react'
import Avatar from './ui/Avatar'
import Message from './Message'
import ChatBox from './ui/ChatBox'
import { ArrowLeft, MessagesSquare, Phone, Video } from 'lucide-react'
import useConversationStore from '@/store/useConversationStore'
import { useSocket } from '@/context/SocketContext'
import { useCall } from '@/context/CallContext'

export default function ChatWindow() {
    const { selectedConversation, setSelectedConversation, setTypingUser, typingUser } = useConversationStore()
    const { onlineUsers, socket } = useSocket()
    const { startCall, status: callStatus } = useCall()
    const isOnline = selectedConversation ? onlineUsers.includes(selectedConversation._id) : false;
    const canCall = Boolean(selectedConversation) && isOnline && callStatus === 'idle'
    const isTyping = Boolean(selectedConversation) && typingUser === selectedConversation?._id

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
    const paneClasses = `h-full min-h-0 min-w-0 flex-1 flex-col bg-[var(--bg)] md:flex ${
        selectedConversation ? 'flex' : 'hidden'
    }`

    if (!selectedConversation) {
        return (
            <div className={`${paneClasses} items-center justify-center p-6`}>
                <div className="flex max-w-sm flex-col items-center text-center animate-fade-in">
                    <div className="relative mb-6 flex h-20 w-20 items-center justify-center overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)] sm:h-24 sm:w-24">
                        {/* Soft brand wash behind the glyph keeps the empty state
                            warm rather than grey. */}
                        <span
                            aria-hidden="true"
                            className="absolute inset-0"
                            style={{ background: 'var(--gradient-wash)' }}
                        />
                        <MessagesSquare className="relative h-9 w-9 text-[var(--primary)] sm:h-10 sm:w-10" />
                    </div>

                    <h1 className="text-xl font-bold tracking-tight text-[var(--text)] sm:text-2xl">
                        Your messages
                    </h1>

                    <p className="mt-2.5 text-sm leading-relaxed text-[var(--muted)]">
                        Pick a conversation from the list to start chatting, or hop on a
                        voice or video call with anyone who&apos;s online.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <main className={`relative ${paneClasses}`}>
            <header className="flex flex-shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-2 py-2.5 sm:px-4 sm:py-3">
                <section className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3'>
                    {/* Back to the list — mobile only, where the panes swap */}
                    <button
                        type='button'
                        onClick={() => setSelectedConversation(null)}
                        aria-label='Back to chats'
                        className='icon-btn h-10 w-10 flex-shrink-0 md:hidden'
                    >
                        <ArrowLeft size={20} />
                    </button>

                    <Avatar
                        src='https://i.pravatar.cc/150?img=4'
                        alt={selectedConversation.name}
                        isOnline={isOnline}
                        size={42}
                    />
                    <div className="min-w-0">
                        <h1 className="truncate text-[15px] font-semibold text-[var(--text)]">
                            {selectedConversation?.name}
                        </h1>
                        <span className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                            {isTyping ? (
                                <span className="font-medium text-[var(--primary)]">typing…</span>
                            ) : (
                                <>
                                    <span
                                        aria-hidden="true"
                                        className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${
                                            isOnline ? 'bg-[var(--success)]' : 'bg-[var(--muted-2)]'
                                        }`}
                                    />
                                    {isOnline ? 'Active now' : 'Offline'}
                                </>
                            )}
                        </span>
                    </div>
                </section>

                <section className='flex flex-shrink-0 items-center gap-1'>
                    <button
                        type='button'
                        onClick={() => handleCall('audio')}
                        disabled={!canCall}
                        title={isOnline ? 'Start audio call' : `${selectedConversation?.name} is offline`}
                        aria-label='Start audio call'
                        className='icon-btn icon-btn-brand h-10 w-10'
                    >
                        <Phone size={19} />
                    </button>
                    <button
                        type='button'
                        onClick={() => handleCall('video')}
                        disabled={!canCall}
                        title={isOnline ? 'Start video call' : `${selectedConversation?.name} is offline`}
                        aria-label='Start video call'
                        className='icon-btn icon-btn-brand h-10 w-10'
                    >
                        <Video size={19} />
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
            <footer className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--surface)] pb-safe">
                <ChatBox />
            </footer>
        </main>
    )
}
