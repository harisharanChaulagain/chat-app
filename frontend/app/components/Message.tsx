import React from 'react'
import ChatMessage from './ui/ChatMessage'

export default function Message() {
  return (
    <div className='text-white'>
          {messages.map(msg => (
              <ChatMessage
                  key={msg.id}
                  message={msg.message}
                  isSender={msg.isSender}
                  avatarUrl={msg.avatarUrl}
                  timestamp="2:45 PM"
              />
          ))}
    </div>
  )
}

const messages = [
    { id: 1, message: 'Hey there!', isSender: false, avatarUrl: 'https://i.pravatar.cc/150?img=8' },
    { id: 2, message: 'Hi! How are you?', isSender: true, avatarUrl: 'https://i.pravatar.cc/150?img=3' },
    { id: 3, message: 'I am doing great, thanks! What about you?', isSender: false },
    { id: 4, message: 'Pretty good! Just building a chat app.', isSender: true },
    { id: 5, message: 'Sounds fun!', isSender: false },
];