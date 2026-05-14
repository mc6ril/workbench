"use client";

import { useQuery } from "@tanstack/react-query";

import type { TicketAttachment } from "@/modules/board/core/domain/ticketAttachment.types";
import {
  ticketAttachmentRepository,
  ticketAttachmentStorage,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

export const useTicketAttachments = (ticketId: string) => {
  return useQuery<TicketAttachment[]>({
    queryKey: queryKeys.ticketAttachments.byTicket(ticketId),
    queryFn: async () => {
      const attachments =
        await ticketAttachmentRepository.listByTicketId(ticketId);

      if (attachments.length === 0) return attachments;

      const paths = attachments.map((a) => a.storagePath);
      const signedUrls = await ticketAttachmentStorage.getSignedUrls(paths);

      return attachments.map((a) => ({
        ...a,
        signedUrl: signedUrls[a.storagePath],
      }));
    },
    staleTime: 1000 * 60 * 45, // 45 min — just under signed URL TTL (1 h)
  });
};
