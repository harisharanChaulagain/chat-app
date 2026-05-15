import mongoose, { Document, Schema, Types } from "mongoose";

export interface IGroup extends Document {
  name: string;
  description: string;
  avatarUrl: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  isActive: boolean;
  settings: {
    allowAnonymous?: boolean;
    requireApproval?: boolean;
    maxMembers?: number;
  };
}

const groupSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    maxlength: 500,
    default: ''
  },
  avatarUrl: { 
    type: String, 
    default: '' 
  },
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: "User"
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  settings: {
    allowAnonymous: { type: Boolean, default: false },
    requireApproval: { type: Boolean, default: false },
    maxMembers: { type: Number, default: 500 }
  }
}, {
  timestamps: true
});

groupSchema.index({ members: 1 });
groupSchema.index({ createdBy: 1 });

export default mongoose.model("Group", groupSchema);