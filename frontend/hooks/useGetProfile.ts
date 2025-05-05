"use client";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { User } from "@/models/user";

export const useGetProfile = (): UseQueryResult<User, Error> => {
  return useQuery<User, Error, User>({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await api.get("/user/profile");
      return data?.user;
    },
  });
};
