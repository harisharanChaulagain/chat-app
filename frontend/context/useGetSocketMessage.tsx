"use client";

import { useEffect } from 'react';
import { useSocket } from './SocketContext';
import useConversationStore from '@/store/useConversationStore';
import useUserInteracted from './useUserInteracted';

export default function useGetSocketMessage(): void {
    const { socket } = useSocket();
    const { addMessage } = useConversationStore();
    const userInteracted = useUserInteracted();

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage: any) => {
            if (userInteracted) {
                const notification = new Audio('/notification_sound.mp3');
                notification.play().catch((err) => {
                    console.log("Audio play failed:", err);
                });
            }

            addMessage(newMessage); 
        };

        socket.on('newMessage', handleNewMessage);

        return () => {
            socket.off('newMessage', handleNewMessage);
        };
    }, [socket, addMessage, userInteracted]);
}
