"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Gender, Intent, Preference, User } from "@/models/user";
import { useUserStore } from "@/store/userStore";

/** Every field is optional, so one section can be saved on its own. */
export type ProfileUpdate = {
  name?: string;
  birthDate?: string | null;
  gender?: Gender | null;
  bio?: string;
  photos?: string[];
  interests?: string[];
  city?: string;
  country?: string;
  intent?: Intent | null;
  preference?: Preference;
  ageMin?: number;
  ageMax?: number;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const setUser = useUserStore((state) => state.setUser);

  return useMutation<User, Error, ProfileUpdate>({
    mutationFn: async (updates: ProfileUpdate) => {
      const { data } = await api.patch("/user/profile", updates);
      return data.user;
    },

    onSuccess: (user) => {
      // The sidebar and header read the store, so update it in place rather
      // than waiting for the next profile refetch.
      setUser(user);
      queryClient.setQueryData(["profile"], user);
      // Preference and age range change who is in the deck.
      queryClient.invalidateQueries({ queryKey: ["discover"] });
    },
  });
};
