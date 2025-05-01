import ChatList from '@/components/ChatList'
import MessageBox from '@/components/ChatWindow'
import React from 'react'
import Signup from './components/Signup'
import Login from './components/Login'

export default function page() {
  return (
    <div className='w-full flex '>
      {/* <ChatList/>
      <MessageBox/> */}
      <Signup/>
      <Login/>
    </div>
  )
}
