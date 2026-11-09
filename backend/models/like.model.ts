import mongoose, { Document, Schema, Types } from "mongoose";

/**
 * One decision, from one member about another.
 *
 * A pass is recorded rather than discarded — it is the only thing that keeps a
 * profile from coming straight back round the Discover deck.
 */
export const LIKE_ACTIONS = ["like", "pass"] as const;
export type LikeAction = (typeof LIKE_ACTIONS)[number];

export interface ILike extends Document {
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  action: LikeAction;
}

const likeSchema = new Schema<ILike>(
  {
    fromUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, enum: LIKE_ACTIONS, required: true },
  },
  { timestamps: true }
);

// One decision per pair per direction — a later like overwrites an earlier pass.
likeSchema.index({ fromUser: 1, toUser: 1 }, { unique: true });
// "Who has already liked me?" — used to seed the deck and to detect matches.
likeSchema.index({ toUser: 1, action: 1 });

export default mongoose.model<ILike>("Like", likeSchema);
