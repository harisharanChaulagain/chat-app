import React from 'react'
import ChatList from './components/ChatList'
import MessageBox from './components/ChatWindow'

export default function page() {
  return (
    <div className='w-full flex '>
      <ChatList/>
      <MessageBox/>
    </div>
  )
}
