import React from 'react'
import { MessageCircle } from 'lucide-react'

/**
 * Full-screen loading splash. Mirrors `GuestGuard`'s `AuthSplash` so a route
 * that suspends looks the same as one that is checking the session.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-screen-dvh items-center justify-center bg-[var(--bg)] px-4"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center gap-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-[var(--radius-xl)] bg-[var(--primary-fill)] animate-pulse-ring">
          <MessageCircle className="h-7 w-7 text-white" />
        </div>
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      </div>
    </div>
  )
}
