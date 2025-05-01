import React from 'react'
import ChatSearch from './ChatSearch'
import Avatar from './ui/Avatar'

type User = {
    id: number;
    name: string;
    email: string;
    avatarUrl: string;
    isOnline: boolean;
};


export default function ChatList() {
    return (
        <main className='w-[30%] h-screen bg-black'>
            <header className=' px-11 mt-4'>
                <p className='font-bold text-3xl text-white'>Chats</p>
                <ChatSearch />
            </header>
            <hr className='text-white my-2' />
            <div className="divide-y divide-slate-700 h-[82vh] overflow-y-auto">
                {users.map(user => (
                    <section
                        key={user.id}
                        className="flex items-center px-6 py-4 space-x-4 text-white hover:bg-slate-600 duration-300 cursor-pointer"
                    >
                        <Avatar src={user.avatarUrl} isOnline={user.isOnline} size={48} />
                        <div>
                            <h1 className="font-semibold">{user.name}</h1>
                            <span className="text-sm text-slate-300">{user.email}</span>
                        </div>
                    </section>
                ))}
            </div>
            <footer></footer>
        </main>
    )
}

const users: User[] = [
    {
        id: 1,
        name: 'Hari Sharan Chaulagain',
        email: 'hari@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=4',
        isOnline: true,
    },
    {
        id: 2,
        name: 'Sita Thapa',
        email: 'sita@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
        isOnline: false,
    },
    {
        id: 3,
        name: 'Ram Bahadur',
        email: 'ram@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=6',
        isOnline: true,
    },
    {
        id: 4,
        name: 'Anita Sharma',
        email: 'anita@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=7',
        isOnline: true,
    },
    {
        id: 5,
        name: 'Bikash Khadka',
        email: 'bikash@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=8',
        isOnline: false,
    },
    {
        id: 6,
        name: 'Sarita Rai',
        email: 'sarita@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=9',
        isOnline: true,
    },
    {
        id: 7,
        name: 'Krishna Lama',
        email: 'krishna@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=10',
        isOnline: false,
    },
    {
        id: 8,
        name: 'Manita Gurung',
        email: 'manita@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=11',
        isOnline: true,
    },
    {
        id: 9,
        name: 'Deepak Adhikari',
        email: 'deepak@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=12',
        isOnline: false,
    },
    {
        id: 10,
        name: 'Rina Khatri',
        email: 'rina@gmail.com',
        avatarUrl: 'https://i.pravatar.cc/150?img=13',
        isOnline: true,
    },
];