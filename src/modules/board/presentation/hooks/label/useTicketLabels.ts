import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  addLabelsToTicket,
  removeLabelsFromTicket,
} from "@/modules/board/core/usecases/label";
import { labelRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

type AddTicketLabelsVariables =
  | string[]
  | {
      ticketId: string;
      labelIds: string[];
    };

const resolveAddTicketLabelsVariables = (
  variables: AddTicketLabelsVariables,
  ticketId?: string
) => {
  if (Array.isArray(variables)) {
    if (!ticketId) {
      throw new Error("ticketId is required when using useAddTicketLabels()");
    }

    return {
      ticketId,
      labelIds: variables,
    };
  }

  return variables;
};

/**
 * Hook for adding labels to a ticket.
 */
export const useAddTicketLabels = (ticketId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: AddTicketLabelsVariables) => {
      const resolved = resolveAddTicketLabelsVariables(variables, ticketId);
      return addLabelsToTicket(
        resolved.ticketId,
        resolved.labelIds,
        labelRepository
      );
    },
    onSuccess: (_data, variables) => {
      const resolved = resolveAddTicketLabelsVariables(variables, ticketId);
      queryClient.invalidateQueries({
        queryKey: queryKeys.labels.byTicket(resolved.ticketId),
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
