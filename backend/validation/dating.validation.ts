import { z } from "zod";
import {
  GENDERS,
  INTENTS,
  MAX_AGE,
  MAX_INTERESTS,
  MAX_PHOTOS,
  MIN_AGE,
  PREFERENCES,
} from "../models/user.model";
import { REPORT_REASONS } from "../models/report.model";
import { ageFromBirthDate } from "../services/dating.service";

/**
 * Photos are stored as links rather than uploaded bytes — there is no object
 * store in this stack. An absolute http(s) URL or a path into `public/` is all
 * that can be served, so anything else is rejected up front.
 */
const photoUrl = z
  .string()
  .trim()
  .min(1, "Photo link cannot be empty")
  .max(2048, "Photo link is too long")
  .refine(
    (value) => /^https?:\/\//i.test(value) || value.startsWith("/"),
    "Use a full https:// link or a path starting with /"
  );

const interest = z
  .string()
  .trim()
  .min(2, "Interests need at least two characters")
  .max(30, "Keep interests short");

/** Accepts both `YYYY-MM-DD` (what `<input type="date">` sends) and ISO stamps. */
const birthDate = z
  .string()
  .trim()
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date")
  .refine((value) => {
    const age = ageFromBirthDate(value);
    return age !== null && age >= MIN_AGE && age <= MAX_AGE;
  }, `You must be between ${MIN_AGE} and ${MAX_AGE}`);

/**
 * Every field is optional so the profile editor can PATCH one section at a
 * time, but `nullable` is only allowed where clearing the value is meaningful.
 */
export const datingProfileSchema = z
  .object({
    name: z.string().trim().min(2, "Name is required").max(60).optional(),
    birthDate: birthDate.nullable().optional(),
    gender: z.enum(GENDERS).nullable().optional(),
    bio: z.string().trim().max(500, "Keep the bio under 500 characters").optional(),
    photos: z
      .array(photoUrl)
      .max(MAX_PHOTOS, `Up to ${MAX_PHOTOS} photos`)
      .optional(),
    interests: z
      .array(interest)
      .max(MAX_INTERESTS, `Up to ${MAX_INTERESTS} interests`)
      .optional(),
    city: z.string().trim().max(80).optional(),
    country: z.string().trim().max(80).optional(),
    intent: z.enum(INTENTS).nullable().optional(),
    preference: z.enum(PREFERENCES).optional(),
    ageMin: z.coerce.number().int().min(MIN_AGE).max(MAX_AGE).optional(),
    ageMax: z.coerce.number().int().min(MIN_AGE).max(MAX_AGE).optional(),
  })
  .refine(
    (data) =>
      data.ageMin === undefined ||
      data.ageMax === undefined ||
      data.ageMin <= data.ageMax,
    { path: ["ageMax"], message: "Maximum age must be at least the minimum" }
  );

export type DatingProfileInput = z.infer<typeof datingProfileSchema>;

/** Discover filters arrive as query strings, hence the coercion. */
export const discoverQuerySchema = z.object({
  minAge: z.coerce.number().int().min(MIN_AGE).max(MAX_AGE).optional(),
  maxAge: z.coerce.number().int().min(MIN_AGE).max(MAX_AGE).optional(),
  /** Overrides the saved preference for this request only. */
  preference: z.enum(PREFERENCES).optional(),
  city: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  /** Comma-separated; a profile matches if it shares any one of them. */
  interests: z.string().trim().max(400).optional(),
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

export const reportSchema = z.object({
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(1000).optional(),
  /** Reporting someone almost always means you also want them gone. */
  block: z.boolean().optional(),
});
