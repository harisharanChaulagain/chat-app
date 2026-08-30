export type CallType = "audio" | "video";

export type CallDirection = "incoming" | "outgoing";

/**
 * Lifecycle of a 1:1 call.
 *  idle       — nothing happening, modal hidden
 *  calling    — we dialled out, waiting for the other side to pick up
 *  ringing    — someone is calling us, waiting for our answer
 *  connecting — offer/answer exchanged, ICE still negotiating
 *  connected  — media is flowing
 *  ended      — terminal state held briefly so the UI can explain why
 */
export type CallStatus =
  | "idle"
  | "calling"
  | "ringing"
  | "connecting"
  | "connected"
  | "ended";

export type CallEndReason =
  | "hangup"
  | "cancelled"
  | "rejected"
  | "busy"
  | "offline"
  | "unanswered"
  | "disconnected"
  | "failed"
  | "media-denied";

export type CallPeer = {
  _id: string;
  name: string;
};

export type IncomingCallPayload = {
  from: string;
  fromName?: string;
  callType: CallType;
  offer: RTCSessionDescriptionInit;
  isGroupCall?: boolean;
  groupId?: string | null;
  timestamp?: number;
};

export type CallAcceptedPayload = {
  from: string;
  answer: RTCSessionDescriptionInit;
  callType?: CallType;
};

export type IceCandidatePayload = {
  from: string;
  candidate: RTCIceCandidateInit;
};

export type CallClosedPayload = {
  from: string;
  callType?: CallType;
  reason?: CallEndReason;
};

/** Human-readable copy for each way a call can end. */
export const CALL_END_MESSAGES: Record<CallEndReason, string> = {
  hangup: "Call ended",
  cancelled: "Call cancelled",
  rejected: "Call declined",
  busy: "User is on another call",
  offline: "User is offline",
  unanswered: "No answer",
  disconnected: "Connection lost",
  failed: "Could not connect",
  "media-denied": "Camera or microphone unavailable",
};
