import React from 'react'
import Signup from '../components/Signup'
import GuestGuard from '../components/GuestGuard'

export default function page() {
    return (
        <GuestGuard>
            <Signup />
        </GuestGuard>
    )
}
