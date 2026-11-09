"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { MatchSummary } from "@/models/user";

/** Active matches, newest first, each with its conversation and last message. */
export const useMatches = () => {
  return useQuery<MatchSummary[]>({
    queryKey: ["matches"],
    queryFn: async () => {
      const { data } = await api.get("/dating/matches");
      return data.matches ?? [];
    },
  });
};
