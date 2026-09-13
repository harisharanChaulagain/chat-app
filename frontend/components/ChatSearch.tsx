"use client";

import { Search, X } from 'lucide-react'
import React from 'react'

type ChatSearchProps = {
    value?: string;
    onChange?: (value: string) => void;
};

export default function ChatSearch({ value, onChange }: ChatSearchProps) {
    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            role="search"
            className="w-full">
            <div className="group relative">
                <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-2)] transition-colors duration-200 group-focus-within:text-[var(--primary)]"
                />
                <input
                    type="search"
                    placeholder="Search messages"
                    aria-label="Search chats"
                    value={value}
                    onChange={(event) => onChange?.(event.target.value)}
                    /* `field-sunken` reads as a recess inside the white sidebar;
                       16px base on touch widths avoids the iOS focus zoom. */
                    className="field field-sunken pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden"
                />
                {value && onChange && (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        aria-label="Clear search"
                        className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--muted-2)] transition-colors duration-200 hover:bg-[var(--surface-3)] hover:text-[var(--text)]"
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </form>
    )
}
