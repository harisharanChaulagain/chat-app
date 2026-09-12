import { create } from "zustand";
import { CallLogInfo } from "@/types/call";

type Conversation = {
  _id: string;
  name: string;
  email: string;
};

export type Message = {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    email: string;
  };
  receiverId: string;
  message: string;
  messageType?: "text" | "image" | "video" | "audio" | "file" | "call";
  /** Present only on `messageType: "call"` entries. */
  callInfo?: CallLogInfo;
  createdAt: string;
  updatedAt: string;
};

type ConversationState = {
  selectedConversation: Conversation | null;
  setSelectedConversation: (conv: Conversation | null) => void;

  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  addMessages: (messages: Message[]) => void;

  currentChatUser: string | null;
  setCurrentChatuser: (userId: string | null) => void;

  typingUser: string | null;
  setTypingUser: (userId: string | null) => void;

  addMessagesAtStart: (messages: Message[]) => void;
};

const useConversationStore = create<ConversationState>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (conv) => set({ selectedConversation: conv }),

  messages: [],
  setMessages: (messages) =>
    set({ messages: Array.isArray(messages) ? messages : [] }),

  addMessage: (message) =>
    set((state) =>
      // A call log reaches both participants over the socket, and a refetch can
      // race with it — keyed by _id so the same entry never lands twice.
      state.messages.some((existing) => existing._id === message._id)
        ? state
        : { messages: [...state.messages, message] }
    ),

  addMessages: (newMessages) =>
    set((state) => ({
      messages: Array.isArray(newMessages)
        ? [...newMessages, ...state.messages]
        : state.messages,
    })),

  addMessagesAtStart: (newMessages) =>
    set((state) => {
      const existingIds = new Set(state.messages.map((msg) => msg._id));

      const uniqueMessages = newMessages.filter(
        (msg) => !existingIds.has(msg._id)
      );

      return {
        messages: [...uniqueMessages, ...state.messages],
      };
    }),

  currentChatUser: null,
  setCurrentChatuser: (userId) => set({ currentChatUser: userId }),

  typingUser: null,
  setTypingUser: (userId) => set({ typingUser: userId }),
}));

export default useConversationStore;
