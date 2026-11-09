"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { ReportReason } from "@/models/user";

export type ReportInput = {
  userId: string;
  reason: ReportReason;
  details?: string;
  /** Reporting someone usually means you also want them gone. */
  block?: boolean;
};

export const useReportUser = () => {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; blocked: boolean },
    Error,
    ReportInput
  >({
    mutationFn: async ({ userId, ...body }: ReportInput) => {
      const { data } = await api.post(`/dating/report/${userId}`, body);
      return data;
    },

    onSuccess: (result) => {
      if (result.blocked) {
        queryClient.invalidateQueries({ queryKey: ["matches"] });
        queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
      }
    },
  });
};
