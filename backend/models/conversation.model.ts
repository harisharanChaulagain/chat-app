import mongoose, { Schema, Types, Document } from "mongoose";

export interface IConversation extends Document {
  participants: Types.ObjectId[];
  messages: Types.ObjectId[];
  type: 'direct' | 'group';
  groupId: Types.ObjectId;
  lastMessage: Types.ObjectId;
  lastMessageAt: Date;
}

const conversationSchema = new Schema({
  participants: [{
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  messages: [{
    type: Schema.Types.ObjectId,
    ref: "Message",
    default: []
  }],
  type: {
    type: String,
    enum: ['direct', 'group'],
    default: 'direct'
  },
  groupId: {
    type: Schema.Types.ObjectId,
    ref: "Group",
    default: null
  },
  lastMessage: {
    type: Schema.Types.ObjectId,
    ref: "Message",
    default: null
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ type: 1, groupId: 1 });
conversationSchema.index({ lastMessageAt: -1 });

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;