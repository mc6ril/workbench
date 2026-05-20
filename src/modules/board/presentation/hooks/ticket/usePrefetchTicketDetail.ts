"use client";

import { useCallback } from "react";

import { useAppRouter } from "@/shared/navigation/useAppRouter";
import { buildTicketDetailRoute } from "@/shared/utils/routes";

export const usePrefetchTicketDetail = (projectId: string) => {
  const router = useAppRouter();

  return useCallback(
    (ticketId: string) => {
      if (!ticketId) {
        return;
      }
      router.prefetch(buildTicketDetailRoute(projectId, ticketId));
    },
    [projectId, router]
  );
};
