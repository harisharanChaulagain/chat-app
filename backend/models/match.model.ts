import mongoose, { Document, Schema, Types } from "mongoose";

export type MatchStatus = "active" | "unmatched";

export interface IMatch extends Document {
  _id: Types.ObjectId;
  /** Always the lower of the two ids — see `orderedPair`. */
  userA: Types.ObjectId;
  userB: Types.ObjectId;
  /** The direct conversation opened by the match; chat is gated on this doc. */
  conversationId: Types.ObjectId;
  status: MatchStatus;
  /** Who walked away, for an unmatched pair. */
  endedBy: Types.ObjectId | null;
  matchedAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    userA: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userB: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    status: { type: String, enum: ["active", "unmatched"], default: "active" },
    endedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    matchedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

/**
 * Storing the pair in a fixed order is what makes this index meaningful: one
 * document per pair, whichever way round the two people liked each other.
 * (A unique index on an array field would instead cap each member at one match.)
 */
matchSchema.index({ userA: 1, userB: 1 }, { unique: true });
matchSchema.index({ userA: 1, status: 1 });
matchSchema.index({ userB: 1, status: 1 });

/** Sorts two ids so a pair always hashes to the same document. */
export const orderedPair = (
  first: Types.ObjectId | string,
  second: Types.ObjectId | string
): [Types.ObjectId, Types.ObjectId] => {
  const a = new Types.ObjectId(String(first));
  const b = new Types.ObjectId(String(second));
  return a.toString() < b.toString() ? [a, b] : [b, a];
};

export default mongoose.model<IMatch>("Match", matchSchema);
