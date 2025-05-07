'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store/userStore';

type SocketContextType = {
    socket: Socket | null;
    onlineUsers: string[];
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUserStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        if (user) {
            const newSocket = io('http://localhost:5000', {
                query: { userId: user._id },
            });

            setSocket(newSocket);

            newSocket.on('getonline', (users: string[]) => {
                setOnlineUsers(users);
                console.log('Online users updated:', users);
            });

            return () => {
                newSocket.disconnect();
            };
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
