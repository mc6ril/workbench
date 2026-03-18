import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addLabelsToTicket,
  removeLabelsFromTicket,
} from "@/domains/project-management/core/usecases/label";

import { labelRepository } from "@/domains/project-management/infrastructure/supabase/repositories";

import { queryKeys } from "@/domains/project-management/presentation/hooks/queryKeys";

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
