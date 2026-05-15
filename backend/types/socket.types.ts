export interface CallPayload {
  userId: string;
  offer?: any;
  answer?: any;
  callType: "audio" | "video";
  fromName?: string;
  isGroupCall?: boolean;
  groupId?: string | null;
}

export interface ICEPayload {
  to: string;
  candidate: RTCIceCandidate;
}

export interface TypingPayload {
  receiverId: string;
  conversationId: string;
  isTyping: boolean;
}