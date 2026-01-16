import { useMutation, useQueryClient } from "@tanstack/react-query";

import { assignTicketToEpic } from "@/core/usecases/ticket/assignTicketToEpic";

import { epicRepository, ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

type AssignTicketToEpicVariables = {
  ticketId: string;
  epicId: string;
};

/**
 * Hook for assigning a ticket to an epic.
 * Invalidates project tickets root, ticket detail, and project epics root on success.
 */
export const useAssignTicketToEpic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, epicId }: AssignTicketToEpicVariables) =>
      assignTicketToEpic(ticketRepository, epicRepository, ticketId, epicId),
    onSuccess: (ticket) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(ticket.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticket.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.epicsRoot(ticket.projectId),
      });
    },
  });
};

