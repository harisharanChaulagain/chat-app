import React from 'react'

export default function ChatSearch() {
    return (
        <form
            //   onSubmit={(e) => e.preventDefault()}
            className="mt-4 w-full max-w-md">
            <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute top-0 bottom-0 left-3 my-auto h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                    type="search"
                    placeholder="Search"
                    aria-label="Search chats"
                    /* 16px base on touch widths avoids the iOS focus zoom. */
                    className="w-full rounded-md border border-transparent bg-slate-900 py-2.5 pl-11 pr-4 text-base text-white outline-none focus:border-gray-600 sm:py-3 sm:text-sm"
                />
            </div>
        </form>
    )
}
