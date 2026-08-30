"use client";

import { useLogout } from "@/hooks/useLogout";
import { useUserStore } from "@/store/userStore";
import { MessageCircle, Users, LogOut } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";

const NAV_ITEMS = [
  { icon: MessageCircle, label: "Chats", path: "/chats" },
  { icon: Users, label: "Friends", path: "/friends" },
];

const getInitials = (name?: string) =>
  name ? name.charAt(0).toUpperCase() : "?";

type SidebarProps = {
  /**
   * Hides the mobile bottom bar. The chats page sets this while a thread is
   * open so the conversation gets the full viewport height.
   */
  mobileHidden?: boolean;
};

export default function Sidebar({ mobileHidden = false }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUserStore();
  const [openProfile, setOpenProfile] = useState(false);
  const { mutate: logout, isPending } = useLogout();
  // Both the rail and the bottom bar are always in the DOM (one is just
  // display:none), so each anchor needs its own ref for the outside-click test.
  const railProfileRef = useRef<HTMLDivElement>(null);
  const barProfileRef = useRef<HTMLDivElement>(null);

  // Close profile popup on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const inside =
        railProfileRef.current?.contains(target) ||
        barProfileRef.current?.contains(target);
      if (!inside) setOpenProfile(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // A route change should never leave the menu hanging open over the new page.
  useEffect(() => {
    setOpenProfile(false);
  }, [pathname]);

  const isActive = (path: string) => Boolean(pathname?.startsWith(path));

  const profileCard = (
    <>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white bg-gradient-to-br from-violet-600 to-cyan-600 flex-shrink-0">
          {getInitials(user?.name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            {user?.name}
          </p>
          <p className="text-xs text-[var(--text-muted)] truncate">
            {user?.email}
          </p>
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
    </>
  );

  return (
    <>
      {/* ── Desktop / tablet: vertical rail ── */}
      <aside className="hidden md:flex h-screen-dvh w-[72px] flex-col justify-between items-center py-5 bg-[var(--bg-secondary)] border-r border-[var(--glass-border)] flex-shrink-0">
        {/* Logo */}
        <div className="mb-6">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] shadow-[var(--shadow-glow)] cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => router.push("/")}
          >
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Nav items */}
        <div className="flex flex-col gap-2 items-center flex-1">
          {NAV_ITEMS.map((item) => (
            <div key={item.path} className="relative group">
              <button
                onClick={() => router.push(item.path)}
                aria-label={item.label}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-mid)] text-white shadow-[var(--shadow-glow)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg-strong)]"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
              {/* Tooltip — pointer devices only, it has no touch equivalent */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)] text-xs font-medium whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 shadow-[var(--shadow-md)] border border-[var(--glass-border)] z-50 pointer-events-none">
                {item.label}
                <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[5px] border-r-[var(--bg-elevated)]" />
              </div>
            </div>
          ))}
        </div>

        {/* User profile */}
        <div className="relative" ref={railProfileRef}>
          <button
            onClick={() => setOpenProfile(!openProfile)}
            aria-label="Account menu"
            aria-expanded={openProfile}
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-violet-600 to-cyan-600 ring-2 ring-transparent hover:ring-[var(--accent-start)] transition-all duration-200 relative"
          >
            {getInitials(user?.name)}
          </button>

          {/* Profile popup */}
          {openProfile && (
            <div
              className="absolute bottom-14 left-0 w-56 glass-card p-4 rounded-xl shadow-[var(--shadow-lg)] z-50 animate-fade-in-up"
              style={{ animationDuration: "200ms" }}
            >
              {profileCard}
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile: bottom tab bar ── */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--glass-border)] bg-[var(--bg-secondary)]/95 backdrop-blur-xl pb-safe ${
          mobileHidden ? "hidden" : "block"
        }`}
      >
        <div className="flex items-stretch justify-around px-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              aria-label={item.label}
              aria-current={isActive(item.path) ? "page" : undefined}
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-muted)]"
              }`}
            >
              <span
                className={`flex h-9 w-12 items-center justify-center rounded-xl transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-mid)] text-white shadow-[var(--shadow-glow)]"
                    : ""
                }`}
              >
                <item.icon className="h-5 w-5" />
              </span>
              {item.label}
            </button>
          ))}

          {/* Account tab — opens the same card, anchored above the bar */}
          <div className="relative flex flex-1" ref={barProfileRef}>
            <button
              onClick={() => setOpenProfile(!openProfile)}
              aria-label="Account menu"
              aria-expanded={openProfile}
              className="flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-[var(--text-muted)]"
            >
              <span className="flex h-9 w-12 items-center justify-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white bg-gradient-to-br from-violet-600 to-cyan-600 ring-2 transition-all duration-200 ${
                    openProfile
                      ? "ring-[var(--accent-start)]"
                      : "ring-transparent"
                  }`}
                >
                  {getInitials(user?.name)}
                </span>
              </span>
              Account
            </button>

            {openProfile && (
              <div
                className="absolute bottom-full right-0 mb-2 w-[min(15rem,calc(100vw-2rem))] glass-card p-4 rounded-xl shadow-[var(--shadow-lg)] z-50 animate-fade-in-up"
                style={{
                  animationDuration: "200ms",
                  background: "var(--bg-elevated)",
                }}
              >
                {profileCard}
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
