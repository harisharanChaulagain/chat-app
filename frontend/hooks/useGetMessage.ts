import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import useConversationStore from "@/store/useConversationStore";

export const useGetMessage = (page: number, limit: number) => {
  const { selectedConversation, setMessages, addMessages, setCurrentChatuser } =
    useConversationStore();

  return useQuery({
    queryKey: ["getMessage", selectedConversation?._id, page, limit],
    enabled: !!selectedConversation?._id,
    queryFn: async () => {
      const { data } = await api.get(
        `/message/get/${selectedConversation?._id}?page=${page}&limit=${limit}`
      );

      const messages = Array.isArray(data.messages) ? data.messages : [];
      const totalPages = data?.totalPages || 0;

      if (page === 0) {
        setMessages(messages);
      } else {
        addMessages(messages);
      }

      return { messages, totalPages };
    },
  });
};
