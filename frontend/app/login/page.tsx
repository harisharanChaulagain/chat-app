import React from 'react'
import Login from '../components/Login'
import GuestGuard from '../components/GuestGuard'

export default function page() {
    return (
        <GuestGuard>
            <Login />
        </GuestGuard>
    )
}
