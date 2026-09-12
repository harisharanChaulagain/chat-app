import Message from "../models/message.model";
import { CallEndReason, CallOutcome, CallType } from "../types/socket.types";
import {
  appendMessage,
  findOrCreateDirectConversation,
} from "./conversation.service";

export interface CallLogInput {
  /** Whoever dialled — becomes the message's senderId, which drives bubble side. */
  callerId: string;
  calleeId: string;
  callType: CallType;
  outcome: CallOutcome;
  /** Seconds of connected media. */
  duration: number;
  endReason?: CallEndReason;
}

/**
 * Plain-text fallback for the required `message` field. It is what any future
 * push-notification or conversation-preview surface would show, so it is
 * written from the caller's point of view rather than left blank.
 */
const summarise = (
  callType: CallType,
  outcome: CallOutcome,
  duration: number
): string => {
  const label = callType === "video" ? "Video call" : "Audio call";

  switch (outcome) {
    case "completed":
      return `${label} · ${formatDuration(duration)}`;
    case "missed":
      return `Missed ${callType} call`;
    case "declined":
      return `${label} declined`;
    case "cancelled":
      return `${label} cancelled`;
    case "failed":
      return `${label} failed`;
    default:
      return label;
  }
};

const formatDuration = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};

/**
 * Writes one call-history entry into the two participants' conversation and
 * returns it populated, ready to be pushed over the socket.
 *
 * Returns null rather than throwing: a failure to record history must never
 * take down call teardown, which is what the caller is in the middle of.
 */
export const recordCallLog = async ({
  callerId,
  calleeId,
  callType,
  outcome,
  duration,
  endReason,
}: CallLogInput) => {
  try {
    const conversation = await findOrCreateDirectConversation(
      callerId,
      calleeId
    );

    const message = new Message({
      senderId: callerId,
      receiverId: calleeId,
      groupId: null,
      message: summarise(callType, outcome, duration),
      messageType: "call",
      callInfo: {
        callType,
        outcome,
        duration: outcome === "completed" ? duration : 0,
        endReason,
      },
      isRead: false,
      readBy: [],
    });

    appendMessage(conversation, message._id);

    await Promise.all([conversation.save(), message.save()]);
    await message.populate("senderId", "name email");

    return message;
  } catch (error: unknown) {
    console.error("Failed to record call log:", error);
    return null;
  }
};
