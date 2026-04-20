import type { Ticket } from "@/modules/board/core/domain/ticket.types";

export type RealtimePostgresEvent = "*" | "INSERT" | "UPDATE" | "DELETE";

export type RealtimePostgresChangesFilter = {
  event: RealtimePostgresEvent;
  schema: string;
  table: string;
  filter?: string;
};

export type RealtimeCallback = (payload: unknown) => void;

/**
 * Contract used by Presentation to register project realtime subscriptions.
 * Implementations must return a chainable channel object and support cleanup.
 */
export type RealtimeChannel = {
  on: (
    event: "postgres_changes",
    filter: RealtimePostgresChangesFilter,
    callback: RealtimeCallback
  ) => RealtimeChannel;
  subscribe: () => RealtimeSubscription;
};

/**
 * Opaque subscription handle returned by the realtime provider.
 * It is only consumed by removeChannel for cleanup.
 */
export type RealtimeSubscription = unknown;

/**
 * Realtime port for channel lifecycle and row-to-domain mapping.
 * Implementations must expose deterministic, pure mapping functions.
 */
export type RealtimeRepository = {
  createChannel: (channelName: string) => RealtimeChannel;
  removeChannel: (subscription: RealtimeSubscription) => Promise<void>;
  mapTicketRowToDomain: (row: Record<string, unknown>) => Ticket;
};
