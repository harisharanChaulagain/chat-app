"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DatingProfile } from "@/models/user";

/** Everyone the signed-in member has blocked. */
export const useBlockedUsers = (enabled = true) => {
  return useQuery<DatingProfile[]>({
    queryKey: ["blockedUsers"],
    queryFn: async () => {
      const { data } = await api.get("/dating/blocked");
      return data.blocked ?? [];
    },
    enabled,
  });
};

export const useUnblockUser = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (userId: string) => {
      const { data } = await api.delete(`/dating/block/${userId}`);
      return data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
};
