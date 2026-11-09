"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";

/** Ends a match. Both people drop out of each other's decks. */
export const useUnmatch = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string; matchId: string | null }, Error, string>(
    {
      mutationFn: async (userId: string) => {
        const { data } = await api.delete(`/dating/matches/${userId}`);
        return data;
      },

      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      },
    }
  );
};
