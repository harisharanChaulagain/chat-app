"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { DiscoverFilters, DiscoverProfile } from "@/models/user";

/** Serialises the filter object into the query string the API expects. */
const toParams = (filters: DiscoverFilters) => {
  const params: Record<string, string> = {};

  if (filters.minAge !== undefined) params.minAge = String(filters.minAge);
  if (filters.maxAge !== undefined) params.maxAge = String(filters.maxAge);
  if (filters.preference) params.preference = filters.preference;
  if (filters.city?.trim()) params.city = filters.city.trim();
  if (filters.country?.trim()) params.country = filters.country.trim();
  if (filters.interests?.length) params.interests = filters.interests.join(",");

  return params;
};

/**
 * One batch of Discover profiles.
 *
 * Deliberately not invalidated by like/pass: the page walks through the batch
 * it already has and refetches once the deck is empty, so a decision never
 * reshuffles the cards underneath the member.
 */
export const useDiscover = (filters: DiscoverFilters) => {
  return useQuery<DiscoverProfile[]>({
    queryKey: ["discover", filters],
    queryFn: async () => {
      const { data } = await api.get("/dating/discover", {
        params: toParams(filters),
      });
      return data.profiles ?? [];
    },
    staleTime: 30 * 1000,
  });
};
