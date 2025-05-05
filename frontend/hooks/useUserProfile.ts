import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { User } from "@/models/user";

export const useUserProfile = () => {
  return useQuery<User[]>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const {
        data: { allUsers },
      } = await api.get("/user/getUserProfile");
      return allUsers;
    },
  });
};
