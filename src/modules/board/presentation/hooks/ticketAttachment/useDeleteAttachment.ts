"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { TicketAttachment } from "@/modules/board/core/domain/ticketAttachment.types";
import { ticketAttachmentRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

export const useDeleteAttachment = (ticketId: string) => {
  const queryClient = useQueryClient();
  const cacheKey = queryKeys.ticketAttachments.byTicket(ticketId);

  return useMutation({
    mutationFn: (attachment: Pick<TicketAttachment, "id" | "storagePath">) =>
      ticketAttachmentRepository.delete(attachment.id, attachment.storagePath),
    onMutate: async (attachment) => {
      await queryClient.cancelQueries({ queryKey: cacheKey });
      const previous = queryClient.getQueryData<TicketAttachment[]>(cacheKey);
      queryClient.setQueryData<TicketAttachment[]>(cacheKey, (old) =>
        (old ?? []).filter((a) => a.id !== attachment.id)
      );
      return { previous };
    },
    onError: (_, __, context) => {
      if (context?.previous) {
        queryClient.setQueryData(cacheKey, context.previous);
      }
    },
  });
};
