import React from "react";

/**
 * Flat illustration of two people connecting — the one visual shared by the
 * landing hero and both auth screens, so the product reads as a single thing.
 *
 * Every fill is a palette token, so the art follows the theme instead of
 * needing a second dark-mode asset. Solid fills only: no gradients, no blurs.
 */
export default function ConnectionArt({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 420 360"
      className={className}
      role="img"
      aria-label="Two people connected by a heart, surrounded by chat bubbles"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Soft ground, so the cards have something to sit on */}
      <circle cx="210" cy="180" r="150" fill="var(--primary-soft)" />

      {/* Loose confetti — keeps the corners from reading as empty */}
      <circle cx="386" cy="112" r="8" fill="var(--primary-soft-strong)" />
      <circle cx="34" cy="252" r="10" fill="var(--accent-soft)" />

      {/* Incoming message */}
      <g>
        <rect
          x="20"
          y="36"
          width="96"
          height="36"
          rx="18"
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle cx="54" cy="54" r="4" fill="var(--muted-2)" />
        <circle cx="68" cy="54" r="4" fill="var(--muted-2)" />
        <circle cx="82" cy="54" r="4" fill="var(--muted-2)" />
      </g>

      {/* Left profile card */}
      <g>
        <rect
          x="48"
          y="96"
          width="138"
          height="176"
          rx="18"
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle cx="117" cy="152" r="34" fill="var(--primary-soft-strong)" />
        <circle cx="117" cy="142" r="13" fill="var(--primary)" />
        {/* Shoulders: curved on top, then clipped back along the avatar circle */}
        <path
          d="M92.9 176.1C93.5 165 103 160 117 160C131 160 140.5 165 141.1 176.1A34 34 0 0 1 92.9 176.1Z"
          fill="var(--primary)"
        />
        <rect x="76" y="206" width="82" height="10" rx="5" fill="var(--border-strong)" />
        <rect x="90" y="226" width="54" height="8" rx="4" fill="var(--surface-3)" />
      </g>

      {/* Right profile card — offset upward so the pair reads as a couple
          rather than a grid */}
      <g>
        <rect
          x="234"
          y="68"
          width="138"
          height="176"
          rx="18"
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth="2"
        />
        <circle cx="303" cy="124" r="34" fill="var(--accent-soft)" />
        <circle cx="303" cy="114" r="13" fill="var(--accent)" />
        <path
          d="M278.9 148.1C279.5 137 289 132 303 132C317 132 326.5 137 327.1 148.1A34 34 0 0 1 278.9 148.1Z"
          fill="var(--accent)"
        />
        <rect x="262" y="178" width="82" height="10" rx="5" fill="var(--border-strong)" />
        <rect x="276" y="198" width="54" height="8" rx="4" fill="var(--surface-3)" />
      </g>

      {/* The match. Sits in the overlap of the two cards; the surface-coloured
          ring hides the card borders passing underneath. */}
      <circle
        cx="210"
        cy="170"
        r="34"
        fill="var(--primary-fill)"
        stroke="var(--surface)"
        strokeWidth="6"
      />
      <g transform="translate(194 153.5) scale(1.3333)">
        <path
          d="M12 21C12 21 3 14.5 3 8.8C3 5.6 5.5 3 8.6 3C10.4 3 12 4.2 12 4.2C12 4.2 13.6 3 15.4 3C18.5 3 21 5.6 21 8.8C21 14.5 12 21 12 21Z"
          fill="#ffffff"
        />
      </g>

      {/* Reply */}
      <g>
        <rect x="294" y="280" width="104" height="36" rx="18" fill="var(--primary-fill)" />
        <circle cx="332" cy="298" r="4" fill="#ffffff" />
        <circle cx="346" cy="298" r="4" fill="#ffffff" />
        <circle cx="360" cy="298" r="4" fill="#ffffff" />
      </g>
    </svg>
  );
}
