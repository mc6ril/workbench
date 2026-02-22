import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type { TicketAssignee } from "@/core/domain/schema/ticket.schema";

import { assignTicket } from "@/core/usecases/ticket/assignTicket";
import { unassignTicket } from "@/core/usecases/ticket/unassignTicket";

import { ticketRepository } from "@/infrastructure/supabase/repositories";

import { queryKeys } from "@/presentation/hooks/queryKeys";

/**
 * Hook for fetching assignees of a specific ticket.
 *
 * @param ticketId - Ticket ID (query disabled when undefined)
 * @returns React Query hook result with assignees array
 */
export const useTicketAssignees = (ticketId: string | undefined) => {
  return useQuery<TicketAssignee[]>({
    queryKey: ["ticket-assignees", ticketId] as const,
    queryFn: () => ticketRepository.getAssignees(ticketId!),
    enabled: !!ticketId,
  });
};

/**
 * Hook for assigning users to a ticket.
 * Invalidates ticket assignees and ticket list queries on success.
 *
 * @returns Mutation object
 */
export const useAssignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      userIds,
    }: {
      ticketId: string;
      userIds: string[];
      projectId: string;
    }) => assignTicket(ticketRepository, ticketId, userIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket-assignees", variables.ticketId],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(variables.projectId),
      });
    },
  });
};

/**
 * Hook for unassigning users from a ticket.
 * Invalidates ticket assignees and ticket list queries on success.
 *
 * @returns Mutation object
 */
export const useUnassignTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ticketId,
      userIds,
    }: {
      ticketId: string;
      userIds: string[];
      projectId: string;
    }) => unassignTicket(ticketRepository, ticketId, userIds),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["ticket-assignees", variables.ticketId],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(variables.projectId),
      });
    },
  });
};
