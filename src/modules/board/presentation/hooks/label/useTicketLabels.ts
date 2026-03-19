import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addLabelsToTicket,
  removeLabelsFromTicket,
} from "@/modules/board/core/usecases/label";

import { labelRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

/**
 * Hook for adding labels to a ticket.
 */
export const useAddTicketLabels = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelIds: string[]) =>
      addLabelsToTicket(ticketId, labelIds, labelRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.labels.byTicket(ticketId),
      });
    },
  });
};

/**
 * Hook for removing labels from a ticket.
 */
export const useRemoveTicketLabels = (ticketId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (labelIds: string[]) =>
      removeLabelsFromTicket(ticketId, labelIds, labelRepository),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.labels.byTicket(ticketId),
      });
    },
  });
};
