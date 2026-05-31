import ChatList from '@/components/ChatList'
import ChatWindow from '@/components/ChatWindow'
import React from 'react'

export default function page() {
    return (
        <div>
            <div className='w-full flex '>
                <ChatList />
                <ChatWindow />
            </div>
        </div>
    )
}
