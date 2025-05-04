"use client"
import React from 'react'
import Avatar from './ui/Avatar'
import Message from './Message'
import ChatBox from './ui/ChatBox'
import { Phone, Video } from 'lucide-react'
import useConversationStore from '@/store/useConversationStore'

export default function MessageBox() {
    const { selectedConversation } = useConversationStore()
    console.log("selectedConversation", selectedConversation)

    const handleSendMessage = () => {
        console.log("hello k chha!")
    };

    return (
        <div className='w-[70%] h-screen bg-slate-950 flex flex-col justify-between'>
            <header
                className="flex items-center justify-between px-6 py-4 space-x-4 text-white bg-slate-600 "
            >
                <section className='flex  space-x-4 '>
                    <Avatar src='https://i.pravatar.cc/150?img=4' isOnline={true} size={48} />
                    <div>
                        <h1 className="font-semibold">{selectedConversation?.name}</h1>
                        <span className="text-sm text-slate-300">Online</span>
                    </div>
                </section>
                <section className='flex items-center gap-4 '>
                    <div className='cursor-pointer'>
                        <Phone />
                    </div>
                    <div className='cursor-pointer'>
                        <Video />
                    </div>
                </section>
            </header>
            <main>
                <Message />
            </main>
            <footer className=''>
                <ChatBox onSend={handleSendMessage} />
            </footer>
        </div>
    )
}
