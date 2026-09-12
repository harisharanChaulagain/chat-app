import { Types } from "mongoose";
import Conversation from "../models/conversation.model";

type UserRef = Types.ObjectId | string;

/**
 * The direct conversation between two users, created on first contact.
 *
 * Both the REST send-message path and the call-log writer need this, and a call
 * can legitimately be the very first thing that ever happens between two
 * people — so the conversation has to be created on demand here too.
 */
export const findOrCreateDirectConversation = async (
  userA: UserRef,
  userB: UserRef
) => {
  const existing = await Conversation.findOne({
    participants: { $all: [userA, userB] },
    type: "direct",
  });

  if (existing) return existing;

  return Conversation.create({
    participants: [userA, userB],
    messages: [],
    type: "direct",
    lastMessageAt: new Date(),
  });
};

/**
 * Links a message into a conversation and moves its "last activity" markers.
 * The caller is responsible for saving both documents.
 */
export const appendMessage = (
  conversation: { messages: Types.ObjectId[]; lastMessage: unknown; lastMessageAt: Date },
  messageId: Types.ObjectId
): void => {
  conversation.messages.push(messageId);
  conversation.lastMessage = messageId;
  conversation.lastMessageAt = new Date();
};
