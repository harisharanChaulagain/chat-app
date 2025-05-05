'use client'
import { useGetProfile } from '@/hooks/useGetProfile';
import { useUserStore } from '@/store/userStore';
import  { useEffect } from 'react';

export default function UserProfile() {
    const { data, isSuccess } = useGetProfile();
    const { setUser } = useUserStore();

    useEffect(() => {
        if (isSuccess && data) {
            setUser(data);
        }
    }, [isSuccess, data, setUser]);

    return null; 
}
