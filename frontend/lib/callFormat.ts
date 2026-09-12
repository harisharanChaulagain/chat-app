import { CallLogInfo } from "@/types/call";

/**
 * mm:ss, or h:mm:ss once a call runs past the hour.
 * Shared by the live call timer and the chat history entry so a call never
 * reads one way on screen and another way in the thread.
 */
export const formatCallDuration = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const pad = (value: number) => String(value).padStart(2, "0");
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
};

export type CallLogTone = "neutral" | "missed";

export type CallLogDescription = {
  /** Primary line, e.g. "Audio call" or "Missed video call". */
  label: string;
  /** Secondary line — the duration, or a call-back nudge. Empty when there is nothing to add. */
  detail: string;
  tone: CallLogTone;
};

/**
 * Turns a stored call log into the words this particular viewer should see.
 *
 * The same document is read by both participants, so outcome alone is not
 * enough: an unanswered call the caller abandoned is "Cancelled" to them and
 * "Missed call" to the person whose phone was ringing.
 */
export const describeCallLog = (
  info: CallLogInfo,
  isOutgoing: boolean
): CallLogDescription => {
  const noun = info.callType === "video" ? "Video call" : "Audio call";

  switch (info.outcome) {
    case "completed":
      return {
        label: noun,
        detail: formatCallDuration(info.duration),
        tone: "neutral",
      };

    case "missed":
      return isOutgoing
        ? { label: "No answer", detail: "", tone: "neutral" }
        : {
            label: `Missed ${info.callType} call`,
            detail: "Tap to call back",
            tone: "missed",
          };

    case "cancelled":
      return isOutgoing
        ? { label: `${noun} cancelled`, detail: "", tone: "neutral" }
        : {
            label: `Missed ${info.callType} call`,
            detail: "Tap to call back",
            tone: "missed",
          };

    case "declined":
      return isOutgoing
        ? { label: "Call declined", detail: "", tone: "neutral" }
        : { label: "You declined", detail: "", tone: "neutral" };

    case "failed":
      return { label: `${noun} failed`, detail: "", tone: "neutral" };

    default:
      return { label: noun, detail: "", tone: "neutral" };
  }
};
