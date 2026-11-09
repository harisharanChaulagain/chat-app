import mongoose, { Document, Schema, Types } from "mongoose";

export const REPORT_REASONS = [
  "inappropriate-photos",
  "harassment",
  "spam-or-scam",
  "fake-profile",
  "underage",
  "other",
] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export interface IReport extends Document {
  reporterId: Types.ObjectId;
  reportedId: Types.ObjectId;
  reason: ReportReason;
  details?: string;
  status: "open" | "reviewed";
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reportedId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, enum: REPORT_REASONS, required: true },
    details: { type: String, default: "", maxlength: 1000 },
    status: { type: String, enum: ["open", "reviewed"], default: "open" },
  },
  { timestamps: true }
);

reportSchema.index({ reportedId: 1, status: 1 });
reportSchema.index({ reporterId: 1, createdAt: -1 });

export default mongoose.model<IReport>("Report", reportSchema);
