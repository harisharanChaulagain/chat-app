"use client"
import React, { useMemo, useState } from 'react'
import { MessageSquarePlus, SearchX, Users, WifiOff } from 'lucide-react'
import ChatSearch from './ChatSearch'
import Avatar from './ui/Avatar'
import useConversationStore from '@/store/useConversationStore';
import { useSocket } from '@/context/SocketContext';
import { useFriendsProfile } from '@/hooks/useFriendsProfile';

export default function ChatList() {
    const { data, isLoading, error } = useFriendsProfile();
    const { selectedConversation, setSelectedConversation } = useConversationStore()
    const { onlineUsers } = useSocket()
    const [query, setQuery] = useState('')

    // Client-side filter over the already-loaded friend list — no new requests,
    // so search stays instant and the data flow is unchanged.
    const visible = useMemo(() => {
        const term = query.trim().toLowerCase()
        if (!term) return data ?? []
        return (data ?? []).filter(
            (user) =>
                user.name.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term)
        )
    }, [data, query])

    const onlineCount = useMemo(
        () => (data ?? []).filter((user) => onlineUsers.includes(user._id)).length,
        [data, onlineUsers]
    )

    return (
        /* Mobile: full width, and hidden once a thread is open so the thread can
           take over the viewport. Tablet and up: a fixed-width column beside it. */
        <main
            className={`h-full min-h-0 w-full flex-shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex md:w-[320px] lg:w-[360px] xl:w-[400px] ${
                selectedConversation ? 'hidden' : 'flex'
            }`}
        >
            <header className='flex-shrink-0 px-4 pb-3 pt-5 sm:px-5'>
                <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className='text-[22px] font-bold tracking-tight text-[var(--text)]'>Chats</h1>
                        <p className="mt-0.5 text-xs text-[var(--muted)]">
                            {onlineCount > 0 ? (
                                <>
                                    <span className="font-medium text-[var(--success)]">
                                        {onlineCount} online
                                    </span>
                                    {' · '}
                                    {data?.length ?? 0} {data?.length === 1 ? 'friend' : 'friends'}
                                </>
                            ) : (
                                `${data?.length ?? 0} ${data?.length === 1 ? 'friend' : 'friends'}`
                            )}
                        </p>
                    </div>
                </div>

                <div className="mt-4">
                    <ChatSearch value={query} onChange={setQuery} />
                </div>
            </header>

            <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overscroll-contain px-2 pb-mobile-nav sm:px-3">
                {isLoading && <ChatRowSkeletons />}

                {!isLoading && error && (
                    <ListState
                        icon={<WifiOff className="h-6 w-6 text-[var(--danger)]" />}
                        title="Couldn't load chats"
                        description="Check your connection and try again."
                        tone="danger"
                    />
                )}

                {!isLoading && !error && data?.length === 0 && (
                    <ListState
                        icon={<Users className="h-6 w-6 text-[var(--primary)]" />}
                        title="No chats yet"
                        description="Follow someone back on the Friends tab to unlock a conversation."
                    />
                )}

                {!isLoading && !error && (data?.length ?? 0) > 0 && visible.length === 0 && (
                    <ListState
                        icon={<SearchX className="h-6 w-6 text-[var(--primary)]" />}
                        title="No matches"
                        description={`Nobody matches “${query.trim()}”.`}
                    />
                )}

                {visible.map(user => {
                    const isSelected = selectedConversation?._id === user._id;
                    const isOnline = onlineUsers.includes(user?._id)
                    return (
                        <button
                            type="button"
                            key={user._id}
                            aria-current={isSelected ? 'true' : undefined}
                            className={`flex w-full cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2.5 text-left transition-colors duration-150 ${
                                isSelected
                                    ? 'bg-[var(--primary-soft-strong)]'
                                    : 'hover:bg-[var(--surface-2)]'
                            }`}
                            onClick={() => {
                                setSelectedConversation(user)
                            }}
                        >
                            <Avatar
                                src="https://i.pravatar.cc/150?img=4"
                                alt={user.name}
                                isOnline={isOnline}
                                size={46}
                            />
                            <div className="min-w-0 flex-1">
                                <h2
                                    className={`truncate text-[15px] font-semibold ${
                                        isSelected ? 'text-[var(--primary)]' : 'text-[var(--text)]'
                                    }`}
                                >
                                    {user.name}
                                </h2>
                                <span className="mt-0.5 block truncate text-[13px] text-[var(--muted)]">
                                    {isOnline ? (
                                        <span className="text-[var(--success)]">Active now</span>
                                    ) : (
                                        user.email
                                    )}
                                </span>
                            </div>

                            {/* A quiet affordance instead of an unread count — the app
                                does not track unread state. */}
                            <MessageSquarePlus
                                aria-hidden="true"
                                className={`h-4 w-4 flex-shrink-0 transition-opacity duration-150 ${
                                    isSelected
                                        ? 'text-[var(--primary)] opacity-100'
                                        : 'text-[var(--muted-2)] opacity-0'
                                }`}
                            />
                        </button>
                    )
                })}
            </div>
        </main>
    )
}

const ChatRowSkeletons = () => (
    <div className="space-y-1 px-0.5 pt-1">
        {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="flex items-center gap-3 px-2.5 py-2.5">
                <div className="skeleton h-[46px] w-[46px] flex-shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                    <div className="skeleton h-3.5 w-2/5 rounded-full" />
                    <div className="skeleton h-3 w-4/5 rounded-full" />
                </div>
            </div>
        ))}
    </div>
)

const ListState = ({
    icon,
    title,
    description,
    tone = 'brand',
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    tone?: 'brand' | 'danger';
}) => (
    <div className="flex flex-col items-center px-4 py-12 text-center animate-fade-in">
        <div
            className={`mb-3.5 flex h-12 w-12 items-center justify-center rounded-[var(--radius-lg)] border ${
                tone === 'danger'
                    ? 'border-[var(--danger)]/20 bg-[var(--danger-soft)]'
                    : 'border-[var(--border)] bg-[var(--primary-soft)]'
            }`}
        >
            {icon}
        </div>
        <h3 className="text-sm font-semibold text-[var(--text)]">{title}</h3>
        <p className="mt-1.5 max-w-[15rem] text-[13px] leading-relaxed text-[var(--muted)]">
            {description}
        </p>
    </div>
)
