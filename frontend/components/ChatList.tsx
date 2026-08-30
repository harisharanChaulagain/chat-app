"use client"
import React from 'react'
import ChatSearch from './ChatSearch'
import Avatar from './ui/Avatar'
import useConversationStore from '@/store/useConversationStore';
import { useSocket } from '@/context/SocketContext';
import { useFriendsProfile } from '@/hooks/useFriendsProfile';

export default function ChatList() {
    const { data, isLoading, error } = useFriendsProfile();
    const { selectedConversation, setSelectedConversation } = useConversationStore()
    const { onlineUsers } = useSocket()

    return (
        /* Mobile: full width, and hidden once a thread is open so the thread can
           take over the viewport. Tablet and up: a fixed-width column beside it. */
        <main
            className={`h-full min-h-0 w-full flex-shrink-0 flex-col border-r border-slate-800 bg-black md:flex md:w-[300px] lg:w-[340px] xl:w-[380px] ${
                selectedConversation ? 'hidden' : 'flex'
            }`}
        >
            <header className='flex-shrink-0 px-4 pt-4 sm:px-6'>
                <p className='text-2xl font-bold text-white sm:text-3xl'>Chats</p>
                <ChatSearch />
            </header>
            <hr className='mx-4 my-3 flex-shrink-0 border-slate-700 sm:mx-6' />

            <div className="min-h-0 flex-1 divide-y divide-slate-700 overflow-y-auto overscroll-contain px-4 pb-mobile-nav sm:px-6">
                {isLoading && (
                    <p className="py-4 text-sm text-slate-400">Loading chats…</p>
                )}

                {error && (
                    <p className="py-4 text-sm text-red-400">Couldn&apos;t load your chats.</p>
                )}

                {!isLoading && !error && data?.length === 0 && (
                    <p className="py-4 text-sm text-slate-400">
                        No mutual friends yet. Follow someone back to start a chat.
                    </p>
                )}

                {data?.map(user => {
                    const isSelected = selectedConversation?._id === user._id;
                    const isOnline = onlineUsers.includes(user?._id)
                    return (
                        <section
                            key={user._id}
                            className={`flex cursor-pointer items-center gap-3 py-3.5 text-white duration-300 hover:bg-slate-600 sm:gap-4 sm:py-4 ${isSelected ? "bg-slate-600" : ""}`}
                            onClick={() => {
                                setSelectedConversation(user)
                            }}
                        >
                            <Avatar src="https://i.pravatar.cc/150?img=4" isOnline={isOnline} size={44} />
                            <div className="min-w-0 flex-1">
                                <h1 className="truncate font-semibold">{user.name}</h1>
                                <span className="block truncate text-sm text-slate-300">{user.email}</span>
                            </div>
                        </section>
                    )
                })}
            </div>
        </main>
    )
}
