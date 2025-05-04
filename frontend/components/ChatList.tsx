"use client"
import React, { useState } from 'react'
import ChatSearch from './ChatSearch'
import Avatar from './ui/Avatar'
import { useUserProfile } from '@/hooks/useUserProfile';
import useConversationStore from '@/store/useConversationStore';

export default function ChatList() {
    const { data, isLoading, error } = useUserProfile();
    const { selectedConversation, setSelectedConversation } = useConversationStore()

    return (
        <main className='w-[30%] h-screen bg-black'>
            <header className=' px-11 mt-4'>
                <p className='font-bold text-3xl text-white'>Chats</p>
                <ChatSearch />
            </header>
            <hr className='text-white my-2' />
            <div className="divide-y divide-slate-700 h-[82vh] overflow-y-auto">
                {data?.map(user => {
                    const isSelected = selectedConversation?._id === user._id;
                    return (
                        <section
                            key={user._id}
                            className={`flex items-center px-6 py-4 space-x-4 text-white hover:bg-slate-600 duration-300 cursor-pointer ${isSelected ? "bg-slate-600" : ""}`}
                            onClick={() => {
                                setSelectedConversation(user)
                            }}
                        >
                            <Avatar src="https://i.pravatar.cc/150?img=4" isOnline={true} size={48} />
                            <div>
                                <h1 className="font-semibold">{user.name}</h1>
                                <span className="text-sm text-slate-300">{user.email}</span>
                            </div>
                        </section>
                    )
                })}

            </div>
            <footer></footer>
        </main>
    )
}

