import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { BoardConfiguration } from "@/modules/board/core/domain/board.types";
import type {
  Ticket,
  UpdateTicketInput,
} from "@/modules/board/core/domain/ticket.types";
import { updateTicket } from "@/modules/board/core/usecases/ticket/updateTicket";
import { ticketRepository } from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import { patchTicketAcrossProjectLists } from "@/modules/board/presentation/hooks/realtime/useProjectRealtime.helpers";

type UpdateTicketVariables = {
  id: string;
  input: UpdateTicketInput;
  /** Needed only when `input.columnId` changes, to resolve `completedAt` from cache. */
  projectId?: string;
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input, projectId }: UpdateTicketVariables) => {
      // The board's columns are already cached (staleTime: Infinity) from the
      // board view — read them instead of re-fetching to resolve `completedAt`.
      const boardConfig = projectId
        ? queryClient.getQueryData<BoardConfiguration>(
            queryKeys.projects.boardConfiguration(projectId)
          )
        : undefined;
      return updateTicket(
        ticketRepository,
        id,
        input,
        boardConfig?.columns ?? []
      );
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.detail(id),
      });

      const previousTicket = queryClient.getQueryData<Ticket>(
        queryKeys.tickets.detail(id)
      );

      queryClient.setQueryData<Ticket>(queryKeys.tickets.detail(id), (old) => {
        if (!old) return old;
        // Spread only defined values; null is a valid clear, undefined means unspecified
        const patch = Object.fromEntries(
          Object.entries(input).filter(([, v]) => v !== undefined)
        ) as Partial<Ticket>;
        return { ...old, ...patch };
      });

      return { previousTicket, id };
    },
    onError: (_, __, context) => {
      if (context?.previousTicket) {
        queryClient.setQueryData(
          queryKeys.tickets.detail(context.id),
          context.previousTicket
        );
      }
    },
    onSuccess: (ticket) => {
      queryClient.setQueryData(queryKeys.tickets.detail(ticket.id), ticket);
      patchTicketAcrossProjectLists(queryClient, ticket.projectId, ticket);
    },
  });
};
