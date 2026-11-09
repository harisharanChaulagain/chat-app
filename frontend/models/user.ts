/** Mirrors the enums in `backend/models/user.model.ts`. */
export type Gender = "woman" | "man" | "nonbinary" | "other";
export type Preference = "women" | "men" | "everyone";
export type Intent = "long-term" | "short-term" | "friends" | "figuring-it-out";

/** What one member sees of another. Never carries an email address. */
export interface DatingProfile {
  _id: string;
  name: string;
  age: number | null;
  gender: Gender | null;
  bio: string;
  photos: string[];
  interests: string[];
  city: string;
  country: string;
  intent: Intent | null;
}

/** A profile in the Discover deck. */
export interface DiscoverProfile extends DatingProfile {
  /** They already liked you — liking back is an instant match. */
  likesYou: boolean;
}

/**
 * The signed-in member's own profile: everything public, plus the private
 * fields the profile editor round-trips.
 */
export interface User extends DatingProfile {
  email: string;
  birthDate: string | null;
  preference: Preference;
  ageMin: number;
  ageMax: number;
  /** Discover cannot state an age without a birth date. */
  isDiscoverable: boolean;
}

export interface MatchPreviewMessage {
  text: string;
  messageType: string;
  fromMe: boolean;
  createdAt: string;
}

export interface MatchSummary {
  matchId: string;
  matchedAt: string;
  conversationId: string;
  lastMessageAt: string;
  lastMessage: MatchPreviewMessage | null;
  profile: DatingProfile;
}

/** Everything the Discover query can narrow by. */
export interface DiscoverFilters {
  minAge?: number;
  maxAge?: number;
  preference?: Preference;
  city?: string;
  country?: string;
  interests?: string[];
}

export type ReportReason =
  | "inappropriate-photos"
  | "harassment"
  | "spam-or-scam"
  | "fake-profile"
  | "underage"
  | "other";
