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
  addMessage: (message: Message) => void;

  currentChatUser: string | null;
  setCurrentChatuser: (userId: string | null) => void;

    typingUser: string | null;  
  setTypingUser: (userId: string | null) => void; 

};

const useConversationStore = create<ConversationState>((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),

  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  currentChatUser: null,
  setCurrentChatuser: (currentChatUser) => set({ currentChatUser }),

   typingUser: null, 
  setTypingUser: (userId: string | null) => set({ typingUser: userId }),
}));

export default useConversationStore;
