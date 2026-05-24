import { create } from "zustand";

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
    set((state) => ({ messages: [...state.messages, message] })),

  addMessages: (newMessages) =>
    set((state) => ({
      messages: Array.isArray(newMessages)
        ? [...state.messages, ...newMessages]
        : state.messages,
    })),

  addMessagesAtStart: (newMessages) =>
    set((state) => ({
      messages: Array.isArray(newMessages)
        ? [...newMessages, ...state.messages]
        : state.messages,
    })),

  currentChatUser: null,
  setCurrentChatuser: (userId) => set({ currentChatUser: userId }),

  typingUser: null,
  setTypingUser: (userId) => set({ typingUser: userId }),
}));

export default useConversationStore;
