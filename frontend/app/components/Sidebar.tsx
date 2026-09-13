"use client";

import { useLogout } from "@/hooks/useLogout";
import { useUserStore } from "@/store/userStore";
import ThemeToggle from "@/components/ui/ThemeToggle";
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
      <div className="mb-3 flex items-center gap-3">
        <div
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          {getInitials(user?.name)}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-[var(--text)]">
            {user?.name}
          </p>
          <p className="truncate text-xs text-[var(--muted)]">{user?.email}</p>
        </div>
      </div>

      <div className="border-t border-[var(--border)] pt-3">
        <p className="mb-1.5 px-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--muted-2)]">
          Appearance
        </p>
        <ThemeToggle variant="segmented" className="w-full" />
      </div>

      <div className="mt-3 border-t border-[var(--border)] pt-2">
        <button
          className="flex w-full items-center gap-2 rounded-[var(--radius-sm)] px-2 py-2 text-sm font-medium text-[var(--danger-text)] transition-colors duration-200 hover:bg-[var(--danger-soft)] disabled:opacity-60"
          onClick={() => logout()}
          disabled={isPending}
        >
          <LogOut className="h-4 w-4" />
          {isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── Desktop / tablet: vertical rail ── */}
      <aside className="hidden h-screen-dvh w-[76px] flex-shrink-0 flex-col items-center justify-between border-r border-[var(--border)] bg-[var(--surface)] py-5 md:flex">
        {/* Logo */}
        <div className="mb-6">
          <button
            type="button"
            aria-label="Home"
            className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-white transition-transform duration-200 hover:scale-105 active:scale-95"
            style={{
              background: "var(--gradient-brand)",
              boxShadow: "var(--shadow-brand)",
            }}
            onClick={() => router.push("/")}
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Nav items */}
        <div className="flex flex-1 flex-col items-center gap-2">
          {NAV_ITEMS.map((item) => (
            <div key={item.path} className="group relative">
              <button
                onClick={() => router.push(item.path)}
                aria-label={item.label}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={`flex h-11 w-11 items-center justify-center rounded-[var(--radius-md)] transition-all duration-200 ${
                  isActive(item.path)
                    ? "bg-[var(--primary-soft-strong)] text-[var(--primary)]"
                    : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
                }`}
              >
                <item.icon className="h-5 w-5" />
              </button>

              {/* Active marker — a short bar on the rail edge */}
              {isActive(item.path) && (
                <span
                  aria-hidden="true"
                  className="absolute -left-5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-[var(--primary)]"
                />
              )}

              {/* Tooltip — pointer devices only, it has no touch equivalent */}
              <div className="pointer-events-none invisible absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 text-xs font-medium text-[var(--text)] opacity-0 shadow-[var(--shadow-md)] transition-all duration-200 group-hover:visible group-hover:opacity-100">
                {item.label}
                <div className="absolute right-full top-1/2 h-0 w-0 -translate-y-1/2 border-b-[5px] border-r-[5px] border-t-[5px] border-b-transparent border-r-[var(--border)] border-t-transparent" />
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
            className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ring-2 ring-offset-2 ring-offset-[var(--surface)] transition-all duration-200 hover:scale-105 ${
              openProfile ? "ring-[var(--primary)]" : "ring-transparent"
            }`}
            style={{ background: "var(--gradient-brand)" }}
          >
            {getInitials(user?.name)}
          </button>

          {/* Profile popup */}
          {openProfile && (
            <div
              className="absolute bottom-14 left-0 z-50 w-60 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] animate-fade-in-up"
              style={{ animationDuration: "200ms" }}
            >
              {profileCard}
            </div>
          )}
        </div>
      </aside>

      {/* ── Mobile: bottom tab bar ── */}
      <nav
        className={`fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--border)] bg-[var(--overlay-surface)] backdrop-blur-xl pb-safe md:hidden ${
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
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors duration-200 ${
                isActive(item.path)
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <span
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 ${
                  isActive(item.path) ? "bg-[var(--primary-soft-strong)]" : ""
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
              className={`flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors duration-200 ${
                openProfile ? "text-[var(--primary)]" : "text-[var(--muted)]"
              }`}
            >
              <span className="flex h-8 w-14 items-center justify-center">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white ring-2 transition-all duration-200 ${
                    openProfile ? "ring-[var(--primary)]" : "ring-transparent"
                  }`}
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {getInitials(user?.name)}
                </span>
              </span>
              Account
            </button>

            {openProfile && (
              <div
                className="absolute bottom-full right-0 z-50 mb-2 w-[min(16rem,calc(100vw-2rem))] rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-lg)] animate-fade-in-up"
                style={{ animationDuration: "200ms" }}
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
