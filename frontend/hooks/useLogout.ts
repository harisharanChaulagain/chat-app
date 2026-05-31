"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export const useLogout = () => {
  const router = useRouter();
  const { clearUser } = useUserStore();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/user/logout");
      return data;
    },

    onSuccess: () => {
      clearUser();
      router.push("/login");
    },

    onError: (error) => {
      console.error("Logout failed:", error);
    },
  });
};
