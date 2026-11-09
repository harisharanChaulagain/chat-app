"use client";

import React, { useEffect, useState } from "react";
import clsx from "clsx";
import { colorFor, initialsOf } from "@/lib/profile";

type ProfilePhotoProps = {
  userId: string;
  name: string;
  photo?: string;
  /** Pixel size — ignored when `fill` is set. */
  size?: number;
  /** Stretches to the parent, which must be positioned. For the big cards. */
  fill?: boolean;
  shape?: "circle" | "rounded";
  isOnline?: boolean;
  showPresence?: boolean;
  ring?: boolean;
  className?: string;
};

/**
 * A member's photo, falling back to a solid initials tile.
 *
 * Photos are member-supplied links, so a dead URL is normal rather than
 * exceptional — the fallback is the same tile used when no photo was added at
 * all, which keeps a list of faces visually even either way.
 *
 * Uses a plain `<img>`: the links point at arbitrary hosts and
 * `next/image` would need every one of them whitelisted in `next.config.ts`.
 */
export default function ProfilePhoto({
  userId,
  name,
  photo,
  size = 48,
  fill = false,
  shape = "circle",
  isOnline = false,
  showPresence = false,
  ring = false,
  className,
}: ProfilePhotoProps) {
  const [failed, setFailed] = useState(false);

  // A new photo deserves a fresh attempt, even if the last one 404'd.
  useEffect(() => {
    setFailed(false);
  }, [photo]);

  const showPhoto = Boolean(photo) && !failed;
  const radius = shape === "circle" ? "rounded-full" : "rounded-[var(--radius-lg)]";

  // The dot scales with the avatar so it stays proportionate from a 32px row
  // up to a 96px profile header, and never shrinks below a visible 9px.
  const dotSize = Math.max(9, Math.round(size * 0.26));

  const body = showPhoto ? (
    <img
      src={photo}
      alt={name}
      onError={() => setFailed(true)}
      className={clsx(
        "block h-full w-full object-cover",
        radius,
        !fill &&
          (ring
            ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--surface)]"
            : "ring-1 ring-[var(--border)]")
      )}
    />
  ) : (
    <span
      aria-hidden="true"
      className={clsx(
        "flex h-full w-full items-center justify-center font-bold text-white",
        radius,
        !fill &&
          (ring
            ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--surface)]"
            : "ring-1 ring-[var(--border)]")
      )}
      style={{
        background: colorFor(userId),
        fontSize: fill ? "clamp(2rem, 18vw, 4.5rem)" : Math.round(size * 0.38),
      }}
    >
      {initialsOf(name)}
    </span>
  );

  if (fill) {
    return (
      <div className={clsx("absolute inset-0 overflow-hidden", className)}>
        {body}
      </div>
    );
  }

  return (
    <div
      className={clsx("relative inline-block flex-shrink-0", className)}
      style={{ width: size, height: size }}
    >
      {body}

      {showPresence && (
        <span
          aria-hidden="true"
          title={isOnline ? "Online" : "Offline"}
          className={clsx(
            "absolute bottom-0 right-0 block rounded-full border-2 border-[var(--surface)]",
            isOnline ? "bg-[var(--success)]" : "bg-[var(--muted-2)]"
          )}
          style={{ width: dotSize, height: dotSize }}
        />
      )}
    </div>
  );
}
