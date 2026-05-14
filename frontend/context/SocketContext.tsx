'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUserStore } from '@/store/userStore';

type UserMap = { [userId: string]: string };

type SocketContextType = {
    socket: Socket | null;
    onlineUsers: string[];
    userMap: UserMap;
};

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
    userMap: {},
});

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useUserStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [userMap, setUserMap] = useState<UserMap>({});

    useEffect(() => {
        const newSocket = io('http://localhost:5000', {
            query: { userId: user?._id },
        });

        setSocket(newSocket);

        newSocket.on('getonline', (users: UserMap) => {
            setUserMap(users);
            setOnlineUsers(Object.keys(users));
        });

        return () => {
            newSocket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, userMap }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error("useSocket must be used within a SocketProvider");
    }
    return context;
};
