import { create } from "zustand";

type Conversation = {
  _id: string;
  name: string;
  email: string;
};

type Message = {
  _id: string;
  text: string;
  sender: string;
  timestamp: string;
};

type ConversationState = {
  selectedConversation: Conversation | null;
  setSelectedConversation: (conv: Conversation | null) => void;

  messages: Message[];
  setMessages: (messages: Message[]) => void;

  currentChatUser: string | null;
  setCurrentChatuser: (userId: string | null) => void;
};

const useConversationStore = create<ConversationState>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),

  messages: [],
  setMessages: (messages) => set({ messages }),

  currentChatUser: null,
  setCurrentChatuser: (currentChatUser) => set({ currentChatUser }),
}));

export default useConversationStore;
