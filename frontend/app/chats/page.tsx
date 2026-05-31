import ChatList from '@/components/ChatList'
import ChatWindow from '@/components/ChatWindow'
import React from 'react'
import Sidebar from '../components/Sidebar'

export default function page() {
    return (
        <div>
            <div className='w-full flex '>
                <Sidebar/>
                <ChatList />
                <ChatWindow />
            </div>
        </div>
    )
}
