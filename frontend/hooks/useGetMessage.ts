import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useConversationStore from "@/store/useConversationStore";

export const useGetMessage = () => {
  const { selectedConversation, setMessages, setCurrentChatuser } =
    useConversationStore();

  return useQuery({
    queryKey: ["getMessage", selectedConversation?._id],
    enabled: !!selectedConversation?._id,
    queryFn: async () => {
      const {
        data: { message, chatUser },
      } = await api.get(`/message/get/${selectedConversation?._id}`);
      setMessages(message || []);
      setCurrentChatuser(chatUser);
      return Array.isArray(message) ? message : [];
    },
  });
};
