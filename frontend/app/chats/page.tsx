import ChatList from '@/components/ChatList'
import MessageBox from '@/components/ChatWindow'
import React from 'react'

export default function page() {
    return (
        <div>
            <div className='w-full flex '>
                <ChatList />
                <MessageBox />
            </div>
        </div>
    )
}
