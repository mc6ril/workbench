import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";

import { createSupabaseBrowserClient } from "@/infrastructure/supabase/shared/client-browser";

import { queryKeys } from "@/presentation/hooks/queryKeys";
import { useProjectRealtime } from "@/presentation/hooks/realtime/useProjectRealtime";

jest.mock("@/infrastructure/supabase/shared/client-browser", () => ({
  createSupabaseBrowserClient: jest.fn(),
}));

type PostgresChangesConfig = {
  event: string;
  schema: string;
  table: string;
  filter?: string;
};

type PostgresChangesHandler = (payload: unknown) => void;

type RealtimeSubscription = {
  topic: string;
};

type RealtimeChannelBuilder = {
  on: (
    eventName: string,
    config: PostgresChangesConfig,
    callback: PostgresChangesHandler
  ) => RealtimeChannelBuilder;
  subscribe: () => RealtimeSubscription;
};

type SupabaseRealtimeClientMock = {
  channel: (channelName: string) => RealtimeChannelBuilder;
  removeChannel: (channel: RealtimeSubscription) => Promise<"ok">;
};

type OnRegistration = {
  eventName: string;
  config: PostgresChangesConfig;
  callback: PostgresChangesHandler;
};

const PROJECT_ID = "project-1";
const BOARD_ID = "board-1";
const TICKET_ID = "ticket-1";

const createWrapper = (queryClient: QueryClient) => {
  const wrapper = ({ children }: PropsWithChildren) => {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };

  return wrapper;
};

const createRealtimeMocks = () => {
  const registrations: OnRegistration[] = [];
  const subscription: RealtimeSubscription = { topic: "project-realtime" };

  const channelBuilder: RealtimeChannelBuilder = {
    on: (eventName, config, callback) => {
      registrations.push({ eventName, config, callback });
      return channelBuilder;
    },
    subscribe: () => subscription,
  };

  const supabaseClientMock: SupabaseRealtimeClientMock = {
    channel: jest.fn(() => channelBuilder),
    removeChannel: jest.fn(async () => "ok"),
  };

  jest
    .mocked(createSupabaseBrowserClient)
    .mockReturnValue(
      supabaseClientMock as unknown as ReturnType<
        typeof createSupabaseBrowserClient
      >
    );

  return {
    registrations,
    subscription,
    supabaseClientMock,
  };
};

describe("useProjectRealtime", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("subscribes to tickets and columns and invalidates targeted query keys", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    expect(registrations).toHaveLength(9);

    const registrationByTable = new Map<string, OnRegistration>();
    for (const registration of registrations) {
      registrationByTable.set(registration.config.table, registration);
    }

    expect(registrationByTable.get("tickets")).toMatchObject({
      eventName: "postgres_changes",
      config: {
        event: "*",
        schema: "public",
        table: "tickets",
        filter: `project_id=eq.${PROJECT_ID}`,
      },
    });
    expect(registrationByTable.get("columns")).toMatchObject({
      eventName: "postgres_changes",
      config: {
        event: "*",
        schema: "public",
        table: "columns",
        filter: `board_id=eq.${BOARD_ID}`,
      },
    });
    expect(registrationByTable.get("epics")).toBeDefined();
    expect(registrationByTable.get("sprints")).toBeDefined();
    expect(registrationByTable.get("labels")).toBeDefined();
    expect(registrationByTable.get("project_members")).toBeDefined();
    expect(registrationByTable.get("comments")).toBeDefined();
    expect(registrationByTable.get("ticket_assignees")).toBeDefined();
    expect(registrationByTable.get("ticket_labels")).toBeDefined();

    const ticketCallback = registrationByTable.get("tickets")?.callback;
    const columnsCallback = registrationByTable.get("columns")?.callback;
    const commentsCallback = registrationByTable.get("comments")?.callback;
    const ticketAssigneesCallback =
      registrationByTable.get("ticket_assignees")?.callback;
    const ticketLabelsCallback =
      registrationByTable.get("ticket_labels")?.callback;
    const epicsCallback = registrationByTable.get("epics")?.callback;
    const sprintsCallback = registrationByTable.get("sprints")?.callback;
    const labelsCallback = registrationByTable.get("labels")?.callback;
    const membersCallback =
      registrationByTable.get("project_members")?.callback;

    expect(ticketCallback).toBeDefined();
    expect(columnsCallback).toBeDefined();
    expect(commentsCallback).toBeDefined();
    expect(ticketAssigneesCallback).toBeDefined();
    expect(ticketLabelsCallback).toBeDefined();
    expect(epicsCallback).toBeDefined();
    expect(sprintsCallback).toBeDefined();
    expect(labelsCallback).toBeDefined();
    expect(membersCallback).toBeDefined();

    ticketCallback?.({
      eventType: "UPDATE",
      new: { id: TICKET_ID },
    });

    columnsCallback?.({
      eventType: "UPDATE",
      new: { id: "column-1" },
    });

    commentsCallback?.({
      eventType: "INSERT",
      new: { ticket_id: TICKET_ID },
    });

    ticketAssigneesCallback?.({
      eventType: "DELETE",
      old: { id: "assignee-1" },
    });

    ticketLabelsCallback?.({
      eventType: "DELETE",
      old: { ticket_id: TICKET_ID },
    });

    epicsCallback?.({
      eventType: "UPDATE",
      new: { id: "epic-1" },
    });

    sprintsCallback?.({
      eventType: "UPDATE",
      new: { id: "sprint-1" },
    });

    labelsCallback?.({
      eventType: "UPDATE",
      new: { id: "label-1" },
    });

    membersCallback?.({
      eventType: "UPDATE",
      new: { id: "member-1" },
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.projects.ticketsRoot(PROJECT_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.projects.epicsRoot(PROJECT_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.detail(TICKET_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.projects.boardConfiguration(PROJECT_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.comments.byTicket(TICKET_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assigneesRoot(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.labels.byTicket(TICKET_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.epics.detail("epic-1"),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.sprints.byProject(PROJECT_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.labels.byProject(PROJECT_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.members.byProject(PROJECT_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.projects.currentRole(PROJECT_ID),
    });
  });

  it("subscribes only to tickets when boardId is not available", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    renderHook(() => useProjectRealtime(PROJECT_ID), { wrapper });

    expect(registrations).toHaveLength(8);

    const registrationByTable = new Map<string, OnRegistration>();
    for (const registration of registrations) {
      registrationByTable.set(registration.config.table, registration);
    }

    expect(registrationByTable.get("columns")).toBeUndefined();

    registrationByTable.get("tickets")?.callback({
      eventType: "INSERT",
      new: { id: TICKET_ID },
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.projects.ticketsRoot(PROJECT_ID),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.projects.epicsRoot(PROJECT_ID),
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.detail(TICKET_ID),
    });
  });

  it("falls back to root invalidation when payload has no ticket_id", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    const registrationByTable = new Map<string, OnRegistration>();
    for (const registration of registrations) {
      registrationByTable.set(registration.config.table, registration);
    }

    registrationByTable.get("comments")?.callback({
      eventType: "DELETE",
      old: { id: "comment-1" },
    });

    registrationByTable.get("ticket_labels")?.callback({
      eventType: "DELETE",
      old: { id: "ticket-label-1" },
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.comments.root(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.labels.root(),
    });
  });

  it("removes realtime channel on unmount", () => {
    const queryClient = new QueryClient();
    const wrapper = createWrapper(queryClient);
    const { subscription, supabaseClientMock } = createRealtimeMocks();

    const { unmount } = renderHook(
      () => useProjectRealtime(PROJECT_ID, BOARD_ID),
      { wrapper }
    );

    unmount();

    expect(supabaseClientMock.removeChannel).toHaveBeenCalledWith(subscription);
  });
});
