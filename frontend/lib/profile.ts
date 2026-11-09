import { Gender, Intent, Preference } from "@/models/user";

/**
 * Avatar fills — six solid, deep-enough-for-white-text tones drawn around the
 * brand rose, so a grid of faces reads as one palette rather than confetti.
 */
export const AVATAR_COLORS = [
  "#D6336C",
  "#B5417F",
  "#0E7C6B",
  "#C2410C",
  "#3F5FBF",
  "#8A5A2B",
];

/** Stable per-user avatar colour so a face is recognisable across renders. */
export const colorFor = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 100003;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const initialsOf = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "?";

/** Pulls the API's own message out of an axios error, with a safe fallback. */
export const messageFrom = (error: unknown, fallback: string) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message || fallback;

export const GENDER_LABELS: Record<Gender, string> = {
  woman: "Woman",
  man: "Man",
  nonbinary: "Non-binary",
  other: "Other",
};

export const PREFERENCE_LABELS: Record<Preference, string> = {
  women: "Women",
  men: "Men",
  everyone: "Everyone",
};

export const INTENT_LABELS: Record<Intent, string> = {
  "long-term": "Long-term relationship",
  "short-term": "Something casual",
  friends: "New friends",
  "figuring-it-out": "Still figuring it out",
};

/** The short form used on a card, where the full sentence would not fit. */
export const INTENT_SHORT: Record<Intent, string> = {
  "long-term": "Long-term",
  "short-term": "Casual",
  friends: "Friends",
  "figuring-it-out": "Open to options",
};

export const REPORT_REASON_LABELS: Record<string, string> = {
  "inappropriate-photos": "Inappropriate photos",
  harassment: "Harassment or hate",
  "spam-or-scam": "Spam or a scam",
  "fake-profile": "Fake profile",
  underage: "Under 18",
  other: "Something else",
};

/** Starting points for the interest picker — members can type their own too. */
export const INTEREST_SUGGESTIONS = [
  "Coffee",
  "Travel",
  "Live music",
  "Cooking",
  "Hiking",
  "Films",
  "Reading",
  "Gym",
  "Running",
  "Photography",
  "Gaming",
  "Art",
  "Dogs",
  "Cats",
  "Yoga",
  "Football",
  "Cycling",
  "Dancing",
  "Food markets",
  "Board games",
];

export const formatLocation = (city?: string, country?: string) =>
  [city, country].filter(Boolean).join(", ");

/** "Maya, 27" — the age is dropped rather than faked when it is unknown. */
export const nameWithAge = (name: string, age: number | null) =>
  age ? `${name}, ${age}` : name;

/** Compact relative time for match and message lists. */
export const timeAgo = (value?: string | Date | null) => {
  if (!value) return "";

  const then = new Date(value).getTime();
  if (Number.isNaN(then)) return "";

  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w`;

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
  });
};

/** `<input type="date">` wants `YYYY-MM-DD`, never a full ISO stamp. */
export const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

/** Describes a non-text last message, which has no readable body of its own. */
export const previewOf = (
  messageType: string,
  text: string,
  fromMe: boolean
) => {
  const body =
    messageType === "call"
      ? "Call"
      : messageType === "image"
        ? "Photo"
        : messageType === "video"
          ? "Video"
          : messageType === "audio"
            ? "Voice note"
            : messageType === "file"
              ? "Attachment"
              : text;

  return fromMe ? `You: ${body}` : body;
};
