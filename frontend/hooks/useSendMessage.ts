import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useSendMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ message, id }: { message: string; id: string }) => {
      const { data } = await api.post(`/message/send/${id}`, JSON.stringify({ message }), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["getMessage", id] });
    },
  });
};
