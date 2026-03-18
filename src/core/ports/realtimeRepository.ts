import type { Epic } from "@/core/domain/schema/epic.schema";
import type { Label } from "@/core/domain/schema/label.schema";
import type { Sprint } from "@/core/domain/schema/sprint.schema";
import type { Ticket } from "@/core/domain/schema/ticket.schema";

export type RealtimePostgresChangesFilter = {
  event: "*";
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
  mapEpicRowToDomain: (row: Record<string, unknown>) => Epic;
  mapLabelRowToDomain: (row: Record<string, unknown>) => Label;
  mapSprintRowToDomain: (row: Record<string, unknown>) => Sprint;
};
