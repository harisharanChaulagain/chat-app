"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * Blocks someone: the match ends, chat closes in both directions and neither
 * profile can reach the other again.
 */
export const useBlockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (userId: string) => {
      const { data } = await api.post(`/dating/block/${userId}`);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
};
