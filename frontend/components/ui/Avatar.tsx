import React from 'react';
import clsx from 'clsx';

type AvatarProps = {
    src: string;
    alt?: string;
    isOnline?: boolean;
    size?: number;
    /** Shows a presence dot only when the caller cares about presence. */
    showPresence?: boolean;
    /** Adds a soft brand ring — used for the selected chat row. */
    ring?: boolean;
    className?: string;
};

const Avatar: React.FC<AvatarProps> = ({
    src,
    alt = 'User Avatar',
    isOnline = false,
    size = 48,
    showPresence = true,
    ring = false,
    className,
}) => {
    // The dot scales with the avatar so it stays proportionate from 32px rows
    // up to the 96px profile header, and never shrinks below a visible 9px.
    const dotSize = Math.max(9, Math.round(size * 0.26));

    return (
        <div
            className={clsx('relative inline-block flex-shrink-0', className)}
            style={{ width: size, height: size }}
        >
            <img
                src={src}
                alt={alt}
                className={clsx(
                    'block h-full w-full flex-shrink-0 rounded-full bg-[var(--surface-2)] object-cover',
                    ring
                        ? 'ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--surface)]'
                        : 'ring-1 ring-[var(--border)]'
                )}
            />

            {showPresence && (
                <span
                    aria-hidden="true"
                    title={isOnline ? 'Online' : 'Offline'}
                    className={clsx(
                        'absolute bottom-0 right-0 block rounded-full border-2 border-[var(--surface)]',
                        isOnline ? 'bg-[var(--success)]' : 'bg-[var(--muted-2)]'
                    )}
                    style={{ width: dotSize, height: dotSize }}
                />
            )}
        </div>
    );
};

export default Avatar;
