"use client";

import { useLogout } from "@/hooks/useLogout";
import { useUserStore } from "@/store/userStore";
import { MessageCircle, Users, User, LogOut, ChevronUp } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();
  const [openProfile, setOpenProfile] = useState(false);
  const { mutate: logout, isPending } = useLogout();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setOpenProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { icon: MessageCircle, label: "Chats", path: "/chats" },
    { icon: Users, label: "Friends", path: "/friends" },
  ];

  const getInitials = (name?: string) => {
    if (!name) return "?";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="h-screen w-[72px] flex flex-col justify-between items-center py-5 bg-[var(--bg-secondary)] border-r border-[var(--glass-border)] flex-shrink-0">
      {/* Logo */}
      <div className="mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] shadow-[var(--shadow-glow)] cursor-pointer hover:scale-105 transition-transform duration-200"
          onClick={() => router.push("/")}
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </div>
      </div>

      {/* Nav items */}
      <div className="flex flex-col gap-2 items-center flex-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <div key={item.path} className="relative group">
              <button
                onClick={() => router.push(item.path)}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-mid)] text-white shadow-[var(--shadow-glow)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-strong)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
              {/* Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-[var(--shadow-md)] border border-[var(--glass-border)] z-50 pointer-events-none">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-[var(--bg-elevated)]" />
              </div>
            </div>
          );
        })}
      </div>

      {/* User profile */}
      <div className="relative" ref={profileRef}>
        <button
          onClick={() => setOpenProfile(!openProfile)}
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-cyan-600 ring-2 ring-transparent hover:ring-[var(--accent-start)] transition-all duration-200 relative"
        >
          {getInitials(user?.name)}
        </button>

        {/* Profile popup */}
        {openProfile && (
          <div className="absolute bottom-14 left-1/2 -translate-x-1/2 w-56 glass-card p-4 rounded-xl shadow-[var(--shadow-lg)] z-50 animate-fade-in-up" style={{ animationDuration: '200ms' }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-violet-600 to-cyan-600 flex-shrink-0">
                {getInitials(user?.name)}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                <p className="text-xs text-[var(--text-muted)] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="border-t border-[var(--glass-border)] pt-2">
              <button
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-[rgba(239,68,68,0.1)] transition-all duration-200"
                onClick={() => logout()}
                disabled={isPending}
              >
                <LogOut className="w-4 h-4" />
                {isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
            {/* Arrow */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--glass-bg)] border-b border-r border-[var(--glass-border)] rotate-45" />
          </div>
        )}
      </div>
    </div>
  );
}