export type CallType = "audio" | "video";

/** Why a call left the "in progress" state. Sent to both peers so the UI can explain itself. */
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

/** Backend runs without the DOM lib, so SDP/ICE are described structurally. */
export interface SessionDescription {
  type: "offer" | "answer" | "pranswer" | "rollback";
  sdp?: string;
}

export interface IceCandidate {
  candidate: string;
  sdpMid?: string | null;
  sdpMLineIndex?: number | null;
  usernameFragment?: string | null;
}

export interface CallPayload {
  userId: string;
  offer?: SessionDescription;
  answer?: SessionDescription;
  callType: CallType;
  fromName?: string;
  isGroupCall?: boolean;
  groupId?: string | null;
}

export interface AnswerCallPayload {
  to: string;
  answer: SessionDescription;
  callType?: CallType;
}

export interface ICEPayload {
  to: string;
  candidate: IceCandidate;
}

export interface RejectCallPayload {
  to: string;
  callType?: CallType;
  reason?: CallEndReason;
}

export interface EndCallPayload {
  to?: string;
  groupId?: string;
  reason?: CallEndReason;
}

export interface TypingPayload {
  receiverId: string;
  conversationId: string;
  isTyping: boolean;
}
