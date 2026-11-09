"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/**
 * Records a pass. The decision is stored rather than dropped — it is what keeps
 * the profile from coming straight back round the deck.
 */
export const usePassProfile = () => {
  return useMutation<{ message: string }, Error, string>({
    mutationFn: async (userId: string) => {
      const { data } = await api.post(`/dating/pass/${userId}`);
      return data;
    },
  });
};
