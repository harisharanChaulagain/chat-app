"use client";

import { useEffect } from 'react';
import { useSocket } from './SocketContext';
import useConversationStore, { Message } from '@/store/useConversationStore';
import useUserInteracted from './useUserInteracted';
import { useUserStore } from '@/store/userStore';

export default function useGetSocketMessage(): void {
    const { socket } = useSocket();
    const { addMessage } = useConversationStore();
    const userInteracted = useUserInteracted();
    const user = useUserStore((state) => state.user);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage: Message) => {
            const { selectedConversation } = useConversationStore.getState();
            if (!selectedConversation) return;

            // Both participants receive a call log, and either of them may have a
            // different thread open at the time — so only take messages that
            // belong to the conversation on screen.
            const senderId = newMessage.senderId?._id;
            const receiverId = newMessage.receiverId;
            const belongsHere =
                senderId === selectedConversation._id ||
                (senderId === user?._id && receiverId === selectedConversation._id);

            if (!belongsHere) return;

            // A call log lands the moment you hang up; chiming at yourself for a
            // call you just took is wrong. Only inbound messages ring.
            const isCallLog = newMessage.messageType === 'call';
            if (userInteracted && !isCallLog && senderId !== user?._id) {
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
    }, [socket, addMessage, userInteracted, user?._id]);
}
