"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/shared/client-browser";

import { queryKeys } from "@/presentation/hooks/queryKeys";

type RealtimePayload = {
  eventType?: "INSERT" | "UPDATE" | "DELETE";
  new?: Record<string, unknown> | null;
  old?: Record<string, unknown> | null;
};

const extractStringField = (
  payload: unknown,
  fieldName: string
): string | null => {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const candidate = payload as RealtimePayload;
  const newValue = candidate.new?.[fieldName];

  if (typeof newValue === "string" && newValue.length > 0) {
    return newValue;
  }

  const oldValue = candidate.old?.[fieldName];

  if (typeof oldValue === "string" && oldValue.length > 0) {
    return oldValue;
  }

  return null;
};

const extractEntityId = (payload: unknown): string | null => {
  return extractStringField(payload, "id");
};

const extractTicketId = (payload: unknown): string | null => {
  return extractStringField(payload, "ticket_id");
};

/**
 * Subscribe to project realtime changes and keep project views fresh.
 * Mounted once at project shell level so board/backlog/epics stay synchronized.
 */
export const useProjectRealtime = (projectId: string, boardId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const supabaseRealtimeClient = createSupabaseBrowserClient();

    const invalidateProjectTickets = () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.ticketsRoot(projectId),
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.projects.epicsRoot(projectId),
      });
    };

    const channelName = `project:${projectId}:realtime`;

    const channelWithTickets = supabaseRealtimeClient.channel(channelName).on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tickets",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        invalidateProjectTickets();

        const candidatePayload = payload as RealtimePayload;
        if (
          candidatePayload.eventType === "UPDATE" ||
          candidatePayload.eventType === "DELETE"
        ) {
          const ticketId = extractEntityId(payload);
          if (ticketId) {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.tickets.detail(ticketId),
            });
          }
        }
      }
    );

    const channelWithColumns = boardId
      ? channelWithTickets.on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "columns",
            filter: `board_id=eq.${boardId}`,
          },
          () => {
            void queryClient.invalidateQueries({
              queryKey: queryKeys.projects.boardConfiguration(projectId),
            });
          }
        )
      : channelWithTickets;
    // Note: boardId may be undefined on the first render while board config loads.
    // We intentionally keep tickets subscriptions active immediately and attach
    // columns subscription as soon as boardId is resolved.

    // Important: comments/ticket_assignees/ticket_labels have no project_id column.
    // Supabase Realtime filters are table-column based only, so we cannot scope these
    // subscriptions directly by project at SQL filter level.
    // We therefore subscribe globally and keep invalidations as targeted as possible.
    const channelWithEpics = channelWithColumns.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "epics",
        filter: `project_id=eq.${projectId}`,
      },
      (payload) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.epicsRoot(projectId),
        });

        const epicId = extractEntityId(payload);
        if (epicId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.epics.detail(epicId),
          });
        }
      }
    );

    const channelWithSprints = channelWithEpics.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sprints",
        filter: `project_id=eq.${projectId}`,
      },
      () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.sprints.byProject(projectId),
        });
      }
    );

    const channelWithLabels = channelWithSprints.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "labels",
        filter: `project_id=eq.${projectId}`,
      },
      () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.labels.byProject(projectId),
        });
      }
    );

    const channelWithProjectMembers = channelWithLabels.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "project_members",
        filter: `project_id=eq.${projectId}`,
      },
      () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.members.byProject(projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.currentRole(projectId),
        });
      }
    );

    const channelWithComments = channelWithProjectMembers.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        // No project_id column on this table — subscription is project-unscoped.
        table: "comments",
      },
      (payload) => {
        const ticketId = extractTicketId(payload);
        if (ticketId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.comments.byTicket(ticketId),
          });
          return;
        }

        void queryClient.invalidateQueries({
          queryKey: queryKeys.comments.root(),
        });
      }
    );

    const channelWithTicketAssignees = channelWithComments.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        // No project_id column on this table — subscription is project-unscoped.
        table: "ticket_assignees",
      },
      (_payload) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.tickets.assigneesRoot(),
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.ticketsRoot(projectId),
        });
      }
    );

    const channelWithTicketLabels = channelWithTicketAssignees.on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        // No project_id column on this table — subscription is project-unscoped.
        table: "ticket_labels",
      },
      (payload) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.projects.ticketsRoot(projectId),
        });

        const ticketId = extractTicketId(payload);
        if (ticketId) {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.labels.byTicket(ticketId),
          });
          return;
        }

        void queryClient.invalidateQueries({
          queryKey: queryKeys.labels.root(),
        });
      }
    );

    const channelSubscription = channelWithTicketLabels.subscribe();

    return () => {
      void supabaseRealtimeClient.removeChannel(channelSubscription);
    };
  }, [boardId, projectId, queryClient]);
};
