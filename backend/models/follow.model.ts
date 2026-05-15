import mongoose, { Document, Schema, Types } from "mongoose";

export interface IFollow extends Document {
  followerId: Types.ObjectId;
  followingId: Types.ObjectId;
  status: 'pending' | 'accepted' | 'blocked' | 'declined';
  acceptedAt?: Date;
}

const followSchema = new Schema({
  followerId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  followingId: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'blocked', 'declined'],
    default: 'pending'
  },
  acceptedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for faster lookups
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });
followSchema.index({ followingId: 1, status: 1 });
followSchema.index({ followerId: 1, status: 1 });

export default mongoose.model("Follow", followSchema);