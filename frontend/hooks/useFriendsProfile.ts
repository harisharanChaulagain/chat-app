import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { User } from "@/models/user";

export const useFriendsProfile = () => {
  return useQuery<User[]>({
    queryKey: ["friendsProfile"],
    queryFn: async () => {
      const { data } = await api.get("/friend/friendsProfile");

      return data.friends ?? [];
    },
  });
};