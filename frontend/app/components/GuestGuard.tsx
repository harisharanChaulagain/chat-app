"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

import { useGetProfile } from "@/hooks/useGetProfile";
import { useUserStore } from "@/store/userStore";

const AUTHENTICATED_HOME = "/chats";

export default function GuestGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const storedUser = useUserStore((state) => state.user);
  const { data, isLoading } = useGetProfile();

  const isAuthenticated = Boolean(storedUser || data);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(AUTHENTICATED_HOME);
    }
  }, [isAuthenticated, router]);

  if (isLoading || isAuthenticated) {
    return <AuthSplash />;
  }

  return <>{children}</>;
}

const AuthSplash = () => (
  <div className="flex min-h-screen-dvh items-center justify-center bg-[var(--bg-primary)] px-4">
    <div className="flex flex-col items-center gap-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] shadow-[var(--shadow-glow)] animate-pulse-ring">
        <MessageCircle className="h-7 w-7 text-white" />
      </div>
      <p className="text-sm text-[var(--text-muted)]">Loading ChatVerse…</p>
    </div>
  </div>
);
