import mongoose, { Schema, Document, Types } from "mongoose";

/** How a member describes themselves. */
export const GENDERS = ["woman", "man", "nonbinary", "other"] as const;
export type Gender = (typeof GENDERS)[number];

/** Who a member wants to be shown. */
export const PREFERENCES = ["women", "men", "everyone"] as const;
export type Preference = (typeof PREFERENCES)[number];

/** What they are on here for — shown on the profile card. */
export const INTENTS = [
  "long-term",
  "short-term",
  "friends",
  "figuring-it-out",
] as const;
export type Intent = (typeof INTENTS)[number];

export const MIN_AGE = 18;
export const MAX_AGE = 99;

export const MAX_PHOTOS = 6;
export const MAX_INTERESTS = 12;

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;

  /* ── Dating profile ──────────────────────────────────────────────
     All optional: existing accounts predate these fields and must keep
     working, so nothing here is required and every list defaults to empty. */
  birthDate?: Date;
  gender?: Gender;
  bio?: string;
  /** Ordered — the first entry is the one Discover leads with. */
  photos: string[];
  interests: string[];
  city?: string;
  country?: string;
  intent?: Intent;

  /* ── Discovery preferences ─────────────────────────────────────── */
  preference: Preference;
  ageMin: number;
  ageMax: number;

  /** Nobody in here can reach this account, in either direction. */
  blockedUsers: Types.ObjectId[];
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    birthDate: { type: Date, default: null },
    gender: { type: String, enum: GENDERS, default: null },
    bio: { type: String, default: "", maxlength: 500 },
    photos: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    intent: { type: String, enum: INTENTS, default: null },

    preference: { type: String, enum: PREFERENCES, default: "everyone" },
    ageMin: { type: Number, default: MIN_AGE, min: MIN_AGE, max: MAX_AGE },
    ageMax: { type: Number, default: 45, min: MIN_AGE, max: MAX_AGE },

    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User", default: [] }],
  },
  {
    timestamps: true,
  }
);

// Discover filters on gender + age, and "who blocked me" is a reverse lookup.
userSchema.index({ gender: 1, birthDate: 1 });
userSchema.index({ blockedUsers: 1 });

export default mongoose.model<IUser>("User", userSchema);
