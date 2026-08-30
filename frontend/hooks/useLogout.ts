"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { clearUser } = useUserStore();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/user/logout");
      return data;
    },

    onSuccess: () => {
      clearUser();
      queryClient.clear();
      router.replace("/login");
    },

    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
};
