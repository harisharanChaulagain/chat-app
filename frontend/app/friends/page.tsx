"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Clock3,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  SearchX,
  UserCheck,
  UserMinus,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import { useUserProfile } from "@/hooks/useUserProfile";
import { useFollowUser } from "@/hooks/useFollowUser";
import { useCancelFollowRequest } from "@/hooks/useCancelFollowRequest";
import { useUnfollowUser } from "@/hooks/useUnfollowUser";
import { useSocket } from "@/context/SocketContext";
import useConversationStore from "@/store/useConversationStore";
import { User } from "@/models/user";
import Sidebar from "../components/Sidebar";

type FollowStatus = "follow" | "following" | "requested" | "followBack";
type FilterKey = "all" | FollowStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Everyone" },
  { key: "followBack", label: "Follows you" },
  { key: "follow", label: "Suggested" },
  { key: "requested", label: "Requested" },
  { key: "following", label: "Friends" },
];

const AVATAR_GRADIENTS = [
  "from-violet-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-fuchsia-500 to-purple-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
];

const STATUS_BADGES: Record<FollowStatus, { label: string; className: string } | null> = {
  following: {
    label: "Friend",
    className: "text-[var(--color-success)] bg-[rgba(34,197,94,0.1)] border-[rgba(34,197,94,0.2)]",
  },
  followBack: {
    label: "Follows you",
    className: "text-[var(--accent-end)] bg-[rgba(6,182,212,0.1)] border-[rgba(6,182,212,0.2)]",
  },
  requested: {
    label: "Pending",
    className: "text-[var(--color-warning)] bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.2)]",
  },
  follow: null,
};

/** Stable per-user avatar gradient so a face is recognisable across renders. */
const gradientFor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100003;
  }
  return AVATAR_GRADIENTS[hash % AVATAR_GRADIENTS.length];
};

const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

const messageFrom = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message || fallback;

const FriendsPage = () => {
  const router = useRouter();
  const { onlineUsers } = useSocket();
  const { setSelectedConversation } = useConversationStore();

  // `isPending` (not `isLoading`) stays true through retry back-off gaps, so the
  // skeletons never blink into the empty state while a retry is queued.
  const { data, isPending, isFetching, error, refetch } = useUserProfile();

  const followMutation = useFollowUser();
  const cancelMutation = useCancelFollowRequest();
  const unfollowMutation = useUnfollowUser();

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const users = useMemo(() => data ?? [], [data]);

  // Only the card being acted on should show a spinner.
  const busyUserId =
    (followMutation.isPending && followMutation.variables) ||
    (cancelMutation.isPending && cancelMutation.variables) ||
    (unfollowMutation.isPending && unfollowMutation.variables) ||
    null;

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = {
      all: users.length,
      follow: 0,
      following: 0,
      requested: 0,
      followBack: 0,
    };

    for (const user of users) {
      const status = user.followStatus as FollowStatus;
      if (status in base) base[status] += 1;
    }

    return base;
  }, [users]);

  const visibleUsers = useMemo(() => {
    const term = query.trim().toLowerCase();

    return users.filter((user) => {
      const matchesFilter = filter === "all" || user.followStatus === filter;
      if (!matchesFilter) return false;
      if (!term) return true;

      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    });
  }, [users, query, filter]);

  const runAction = async (
    action: () => Promise<{ message?: string }>,
    fallbackSuccess: string,
    fallbackError: string
  ) => {
    try {
      const response = await action();
      toast.success(response?.message || fallbackSuccess);
    } catch (err: unknown) {
      toast.error(messageFrom(err, fallbackError));
    }
  };

  const handleFollow = (userId: string) =>
    runAction(
      () => followMutation.mutateAsync(userId),
      "Follow request sent",
      "Failed to follow user"
    );

  const handleCancel = (userId: string) =>
    runAction(
      () => cancelMutation.mutateAsync(userId),
      "Follow request cancelled",
      "Failed to cancel request"
    );

  const handleUnfollow = (userId: string) =>
    runAction(
      () => unfollowMutation.mutateAsync(userId),
      "Unfollowed successfully",
      "Failed to unfollow"
    );

  const handleMessage = (user: User) => {
    setSelectedConversation({
      _id: user._id,
      name: user.name,
      email: user.email,
    });
    router.push("/chats");
  };

  return (
    <main className="flex h-screen-dvh w-full overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Sidebar />

      <div className="relative flex min-w-0 flex-1 flex-col">
        {/* Ambient background glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-48 h-[320px] w-[320px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,transparent_70%)] animate-float sm:h-[520px] sm:w-[520px]" />
          <div
            className="absolute -bottom-56 -left-32 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.09)_0%,transparent_70%)] sm:h-[440px] sm:w-[440px]"
            style={{ animation: "float 4s ease-in-out infinite 1s" }}
          />
        </div>

        {/* Header */}
        <header className="relative z-10 flex-shrink-0 border-b border-[var(--glass-border)] bg-[var(--bg-secondary)]/60 px-4 pb-4 pt-5 backdrop-blur-xl sm:px-6 md:px-10 md:pb-5 md:pt-7">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-wrap items-start justify-between gap-3 sm:gap-4">
              <div className="animate-fade-in">
                <h1 className="flex items-center gap-2.5 text-xl font-bold tracking-tight sm:gap-3 sm:text-2xl md:text-3xl">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--accent-start)] to-[var(--accent-end)] shadow-[var(--shadow-glow)] sm:h-10 sm:w-10">
                    <Users className="h-4.5 w-4.5 text-white sm:h-5 sm:w-5" />
                  </span>
                  Discover <span className="gradient-text">People</span>
                </h1>
                <p className="mt-2 max-w-prose text-xs text-[var(--text-secondary)] sm:text-sm">
                  Follow someone back to unlock mutual chats, voice and video calls.
                </p>
              </div>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                aria-label="Refresh people"
                className="flex flex-shrink-0 items-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-2 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg-strong)] hover:text-[var(--text-primary)] disabled:cursor-not-allowed disabled:opacity-60 sm:px-4 sm:py-2.5"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
                />
                {/* Label collapses to an icon-only button on the narrowest phones. */}
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Search */}
            <div className="relative mt-5 w-full max-w-md sm:mt-6">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name or email…"
                aria-label="Search people"
                className="input-dark pl-11 pr-10"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter pills — horizontally scrollable on narrow screens */}
            <div className="-mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar sm:mt-5">
              {FILTERS.map((item) => {
                const isActive = filter === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => setFilter(item.key)}
                    className={`flex flex-shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-xs font-medium transition-all duration-200 sm:px-4 sm:text-sm ${
                      isActive
                        ? "bg-gradient-to-r from-[var(--accent-start)] to-[var(--accent-mid)] text-white shadow-[var(--shadow-glow)]"
                        : "border border-[var(--glass-border)] text-[var(--text-secondary)] hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {item.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[var(--glass-bg-strong)] text-[var(--text-muted)]"
                      }`}
                    >
                      {counts[item.key]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </header>

        {/* Body — extra bottom padding on mobile clears the fixed tab bar */}
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-mobile-nav sm:px-6 md:px-10 md:py-7">
          <div className="mx-auto max-w-6xl">
            {isPending && <CardSkeletonGrid />}

            {!isPending && error && (
              <StateCard
                icon={<AlertCircle className="h-7 w-7 text-[var(--color-error)]" />}
                title="Couldn't load people"
                description="Something went wrong while fetching users. Check your connection and try again."
                action={
                  <button
                    onClick={() => refetch()}
                    className="gradient-btn mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Try again
                  </button>
                }
              />
            )}

            {!isPending && !error && visibleUsers.length === 0 && (
              <StateCard
                icon={
                  query ? (
                    <SearchX className="h-7 w-7 text-[var(--accent-start)]" />
                  ) : (
                    <Users className="h-7 w-7 text-[var(--accent-start)]" />
                  )
                }
                title={query ? "No matches found" : "Nothing here yet"}
                description={
                  query
                    ? `No one matches “${query.trim()}” in this list.`
                    : filter === "all"
                      ? "You're the first one here. Invite a friend to start chatting."
                      : "No people in this category right now."
                }
                action={
                  query ? (
                    <button
                      onClick={() => setQuery("")}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]"
                    >
                      <X className="h-4 w-4" />
                      Clear search
                    </button>
                  ) : filter !== "all" ? (
                    <button
                      onClick={() => setFilter("all")}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[var(--glass-border)] px-5 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-all duration-200 hover:border-[var(--glass-border-hover)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)]"
                    >
                      <Users className="h-4 w-4" />
                      Show everyone
                    </button>
                  ) : null
                }
              />
            )}

            {!isPending && !error && visibleUsers.length > 0 && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
                {visibleUsers.map((user, index) => (
                  <PersonCard
                    key={user._id}
                    user={user}
                    index={index}
                    isOnline={onlineUsers.includes(user._id)}
                    isBusy={busyUserId === user._id}
                    onFollow={handleFollow}
                    onCancel={handleCancel}
                    onUnfollow={handleUnfollow}
                    onMessage={handleMessage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

type PersonCardProps = {
  user: User;
  index: number;
  isOnline: boolean;
  isBusy: boolean;
  onFollow: (userId: string) => void;
  onCancel: (userId: string) => void;
  onUnfollow: (userId: string) => void;
  onMessage: (user: User) => void;
};

const PersonCard = ({
  user,
  index,
  isOnline,
  isBusy,
  onFollow,
  onCancel,
  onUnfollow,
  onMessage,
}: PersonCardProps) => {
  const status = user.followStatus as FollowStatus;
  const badge = STATUS_BADGES[status] ?? null;

  return (
    <article
      className="glass-card group relative overflow-hidden rounded-2xl p-4 opacity-0 animate-fade-in-up sm:p-5"
      style={{
        animationDelay: `${Math.min(index, 11) * 45}ms`,
        animationFillMode: "forwards",
      }}
    >
      {/* Hover wash */}
      <div className="pointer-events-none absolute inset-0 bg-[var(--gradient-subtle)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative z-10">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="relative flex-shrink-0">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${gradientFor(
                user._id
              )} text-base font-bold text-white shadow-[var(--shadow-md)] transition-transform duration-300 group-hover:scale-105 sm:h-[52px] sm:w-[52px]`}
            >
              {initialsOf(user.name)}
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--bg-primary)] ${
                isOnline
                  ? "bg-[var(--color-success)] animate-pulse-glow"
                  : "bg-[var(--text-muted)]"
              }`}
              title={isOnline ? "Online" : "Offline"}
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h2 className="truncate text-base font-semibold text-[var(--text-primary)]">
                {user.name}
              </h2>

              {badge && (
                <span
                  className={`flex-shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge.className}`}
                >
                  {badge.label}
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-sm text-[var(--text-muted)]">
              {user.email}
            </p>

            <p className="mt-1.5 text-xs font-medium text-[var(--text-secondary)]">
              {isOnline ? (
                <span className="text-[var(--color-success)]">Active now</span>
              ) : (
                "Offline"
              )}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 sm:mt-5">
          <ActionButtons
            status={status}
            user={user}
            isBusy={isBusy}
            onFollow={onFollow}
            onCancel={onCancel}
            onUnfollow={onUnfollow}
            onMessage={onMessage}
          />
        </div>
      </div>
    </article>
  );
};

type ActionButtonsProps = Omit<PersonCardProps, "index" | "isOnline"> & {
  status: FollowStatus;
};

const ActionButtons = ({
  status,
  user,
  isBusy,
  onFollow,
  onCancel,
  onUnfollow,
  onMessage,
}: ActionButtonsProps) => {
  const spinner = <Loader2 className="h-4 w-4 animate-spin" />;

  switch (status) {
    case "following":
      return (
        <>
          <button
            onClick={() => onMessage(user)}
            className="gradient-btn flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold"
          >
            <MessageCircle className="h-4 w-4" />
            Message
          </button>

          <button
            onClick={() => onUnfollow(user._id)}
            disabled={isBusy}
            aria-label={`Unfollow ${user.name}`}
            title={`Unfollow ${user.name}`}
            className="flex h-[42px] w-[42px] flex-shrink-0 items-center justify-center rounded-xl border border-[var(--glass-border)] text-[var(--text-muted)] transition-all duration-200 hover:border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy ? spinner : <UserMinus className="h-4 w-4" />}
          </button>
        </>
      );

    case "followBack":
      return (
        <button
          onClick={() => onFollow(user._id)}
          disabled={isBusy}
          className="gradient-btn flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? spinner : <UserCheck className="h-4 w-4" />}
          {isBusy ? "Following…" : "Follow Back"}
        </button>
      );

    case "requested":
      return (
        <button
          onClick={() => onCancel(user._id)}
          disabled={isBusy}
          /* The label only swaps on hover, which touch devices never fire —
             the aria-label/title carry the intent there. */
          aria-label={`Cancel follow request to ${user.name}`}
          title={`Cancel follow request to ${user.name}`}
          className="group/btn flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(245,158,11,0.25)] bg-[rgba(245,158,11,0.1)] px-4 py-2.5 text-sm font-medium text-[var(--color-warning)] transition-all duration-200 hover:border-[rgba(239,68,68,0.3)] hover:bg-[rgba(239,68,68,0.1)] hover:text-[var(--color-error)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? (
            <>
              {spinner}
              Cancelling…
            </>
          ) : (
            <>
              <Clock3 className="h-4 w-4" />
              <span className="group-hover/btn:hidden">Requested</span>
              <span className="hidden group-hover/btn:inline">
                Cancel request
              </span>
            </>
          )}
        </button>
      );

    case "follow":
    default:
      return (
        <button
          onClick={() => onFollow(user._id)}
          disabled={isBusy}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg-strong)] px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] transition-all duration-200 hover:border-[var(--accent-start)] hover:bg-[rgba(139,92,246,0.12)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isBusy ? spinner : <UserPlus className="h-4 w-4" />}
          {isBusy ? "Sending…" : "Follow"}
        </button>
      );
  }
};

const CardSkeletonGrid = () => (
  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3 2xl:grid-cols-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <div
        key={index}
        className="rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 sm:p-5"
      >
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-2xl bg-[var(--bg-elevated)] animate-shimmer sm:h-[52px] sm:w-[52px]" />
          <div className="min-w-0 flex-1 space-y-2.5 pt-1">
            <div className="h-4 w-2/5 rounded bg-[var(--bg-elevated)] animate-shimmer" />
            <div className="h-3 w-4/5 rounded bg-[var(--bg-elevated)] animate-shimmer" />
            <div className="h-3 w-1/4 rounded bg-[var(--bg-elevated)] animate-shimmer" />
          </div>
        </div>
        <div className="mt-4 h-[42px] w-full rounded-xl bg-[var(--bg-elevated)] animate-shimmer sm:mt-5" />
      </div>
    ))}
  </div>
);

const StateCard = ({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center px-2 py-14 text-center animate-fade-in sm:py-20">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--glass-border)] bg-[var(--glass-bg)] sm:mb-5 sm:h-16 sm:w-16">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-[var(--text-primary)] sm:text-lg">{title}</h3>
    <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--text-secondary)]">
      {description}
    </p>
    {action}
  </div>
);

export default FriendsPage;
