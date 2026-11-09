"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DatingProfile } from "@/models/user";

export type LikeResult = {
  matched: boolean;
  message: string;
  matchId?: string;
  conversationId?: string;
  matchedAt?: string;
  /** The person liked — present only on a mutual like. */
  profile?: DatingProfile;
};

/** Records a like. A reciprocal like turns it into a match server-side. */
export const useLikeProfile = () => {
  const queryClient = useQueryClient();

  return useMutation<LikeResult, Error, string>({
    mutationFn: async (userId: string) => {
      const { data } = await api.post(`/dating/like/${userId}`);
      return data;
    },

    onSuccess: (result) => {
      // Only a match changes anything outside the deck.
      if (result.matched) {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
      }
    },
  });
};
