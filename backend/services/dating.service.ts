import { Types } from "mongoose";
import Match, { orderedPair } from "../models/match.model";
import User, {
  Gender,
  Intent,
  MAX_AGE,
  MIN_AGE,
  Preference,
} from "../models/user.model";

type UserRef = Types.ObjectId | string;

/** The subset of a user document the profile mappers need. */
type ProfileSource = {
  _id: Types.ObjectId;
  name: string;
  email?: string;
  birthDate?: Date | null;
  gender?: Gender | null;
  bio?: string;
  photos?: string[];
  interests?: string[];
  city?: string;
  country?: string;
  intent?: Intent | null;
  preference?: Preference;
  ageMin?: number;
  ageMax?: number;
};

/** What another member is allowed to see. Deliberately no email. */
export type PublicProfile = {
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
};

/** Whole birthdays elapsed — the only definition of "age" a member expects. */
export const ageFromBirthDate = (
  birthDate?: Date | string | null
): number | null => {
  if (!birthDate) return null;

  const born = new Date(birthDate);
  if (Number.isNaN(born.getTime())) return null;

  const now = new Date();
  let age = now.getFullYear() - born.getFullYear();

  const hasHadBirthday =
    now.getMonth() > born.getMonth() ||
    (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());

  if (!hasHadBirthday) age -= 1;

  return age;
};

/**
 * Turns an age window into a birth-date window, so the age filter runs as an
 * indexed range query rather than a computed field.
 *
 * Someone is `max` years old right up to the day before their next birthday, so
 * the oldest qualifying birth date is `today - min years` and the youngest is
 * `today - (max + 1) years + 1 day`.
 */
export const birthDateBoundsForAges = (
  minAge: number,
  maxAge: number
): { $gte: Date; $lte: Date } => {
  const now = new Date();

  const latest = new Date(now);
  latest.setFullYear(latest.getFullYear() - minAge);

  const earliest = new Date(now);
  earliest.setFullYear(earliest.getFullYear() - maxAge - 1);
  earliest.setDate(earliest.getDate() + 1);

  return { $gte: earliest, $lte: latest };
};

/** Which genders satisfy a stated preference. `null` means "no filter". */
export const gendersForPreference = (
  preference: Preference
): Gender[] | null => {
  if (preference === "women") return ["woman"];
  if (preference === "men") return ["man"];
  return null;
};

/** The preferences that would show someone of this gender. */
export const preferencesMatching = (
  gender?: Gender | null
): Preference[] | null => {
  if (gender === "woman") return ["women", "everyone"];
  if (gender === "man") return ["men", "everyone"];
  // Nobody has said how they identify, so no reciprocal filter can be applied.
  return null;
};

export const clampAge = (value: number): number =>
  Math.min(MAX_AGE, Math.max(MIN_AGE, Math.round(value)));

/** Escapes user input before it reaches a `$regex`, so a city can contain `(`. */
export const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const publicProfile = (user: ProfileSource): PublicProfile => ({
  _id: user._id.toString(),
  name: user.name,
  age: ageFromBirthDate(user.birthDate),
  gender: user.gender ?? null,
  bio: user.bio ?? "",
  photos: user.photos ?? [],
  interests: user.interests ?? [],
  city: user.city ?? "",
  country: user.country ?? "",
  intent: user.intent ?? null,
});

/**
 * The signed-in member's own view: everything public, plus the private bits the
 * profile editor needs to round-trip.
 */
export const selfProfile = (user: ProfileSource) => ({
  ...publicProfile(user),
  email: user.email ?? "",
  birthDate: user.birthDate ? new Date(user.birthDate).toISOString() : null,
  preference: user.preference ?? "everyone",
  ageMin: user.ageMin ?? MIN_AGE,
  ageMax: user.ageMax ?? 45,
  /** Discover needs a birth date to state an age, and a photo to show a face. */
  isDiscoverable: Boolean(user.birthDate),
});

export const findActiveMatch = (a: UserRef, b: UserRef) => {
  const [userA, userB] = orderedPair(a, b);
  return Match.findOne({ userA, userB, status: "active" });
};

/** True if either side has blocked the other. Blocks cut both directions. */
export const isBlockedBetween = async (
  a: UserRef,
  b: UserRef
): Promise<boolean> => {
  const hit = await User.exists({
    $or: [
      { _id: a, blockedUsers: b },
      { _id: b, blockedUsers: a },
    ],
  });

  return Boolean(hit);
};

/** Everyone this member cannot see, in either direction. */
export const blockedIdsFor = async (
  userId: UserRef
): Promise<Types.ObjectId[]> => {
  const [me, blockedBy] = await Promise.all([
    User.findById(userId).select("blockedUsers").lean(),
    User.find({ blockedUsers: userId }).select("_id").lean(),
  ]);

  return [
    ...((me?.blockedUsers ?? []) as Types.ObjectId[]),
    ...blockedBy.map((doc) => doc._id as Types.ObjectId),
  ];
};
