import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook } from "@testing-library/react";

import { createSupabaseBrowserClient } from "@/shared/infrastructure/supabase/client-browser";

import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";
import { useProjectRealtime } from "@/modules/board/presentation/hooks/realtime/useProjectRealtime";

jest.mock("@/shared/infrastructure/supabase/client-browser", () => ({
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

const getRegistrationByTable = (
  registrations: OnRegistration[]
): Map<string, OnRegistration> => {
  const registrationByTable = new Map<string, OnRegistration>();
  for (const registration of registrations) {
    registrationByTable.set(registration.config.table, registration);
  }
  return registrationByTable;
};

const buildTicketRow = (
  overrides: Partial<Record<string, unknown>> = {}
): Record<string, unknown> => {
  return {
    id: TICKET_ID,
    project_id: PROJECT_ID,
    title: "Refactor realtime invalidation",
    description: null,
    status: "todo",
    position: 1,
    code_number: 42,
    epic_id: null,
    parent_id: null,
    sprint_id: null,
    priority: null,
    due_date: null,
    story_points: null,
    created_by: null,
    completed_at: null,
    archived_at: null,
    archived_week_start: null,
    created_at: "2026-03-08T10:00:00.000Z",
    updated_at: "2026-03-08T10:00:00.000Z",
    ...overrides,
  };
};

describe("useProjectRealtime", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("patches ticket cache on UPDATE without invalidating project tickets root", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    queryClient.setQueryData(queryKeys.tickets.detail(TICKET_ID), {
      id: TICKET_ID,
      projectId: PROJECT_ID,
      title: "Old title",
      description: null,
      status: "todo",
      position: 1,
      codeNumber: 42,
      epicId: null,
      parentId: null,
      sprintId: null,
      priority: null,
      dueDate: null,
      storyPoints: null,
      createdBy: null,
      completedAt: null,
      archivedAt: null,
      archivedWeekStart: null,
      createdAt: new Date("2026-03-08T10:00:00.000Z"),
      updatedAt: new Date("2026-03-08T10:00:00.000Z"),
    });

    queryClient.setQueryData(queryKeys.projects.ticketsList(PROJECT_ID), [
      {
        id: TICKET_ID,
        projectId: PROJECT_ID,
        title: "Old title",
        description: null,
        status: "todo",
        position: 1,
        codeNumber: 42,
        epicId: null,
        parentId: null,
        sprintId: null,
        priority: null,
        dueDate: null,
        storyPoints: null,
        createdBy: null,
        completedAt: null,
        archivedAt: null,
        archivedWeekStart: null,
        createdAt: new Date("2026-03-08T10:00:00.000Z"),
        updatedAt: new Date("2026-03-08T10:00:00.000Z"),
      },
    ]);

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    const registrationByTable = getRegistrationByTable(registrations);
    const ticketsCallback = registrationByTable.get("tickets")?.callback;

    expect(ticketsCallback).toBeDefined();

    ticketsCallback?.({
      eventType: "UPDATE",
      old: buildTicketRow(),
      new: buildTicketRow({
        title: "New title",
        updated_at: "2026-03-08T11:00:00.000Z",
      }),
    });

    const updatedTicketDetail = queryClient.getQueryData<{
      title: string;
    }>(queryKeys.tickets.detail(TICKET_ID));
    expect(updatedTicketDetail?.title).toBe("New title");

    const updatedTicketList = queryClient.getQueryData<
      Array<{ title: string }>
    >(queryKeys.projects.ticketsList(PROJECT_ID));
    expect(updatedTicketList?.[0]?.title).toBe("New title");

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.projects.ticketsRoot(PROJECT_ID),
      })
    );
  });

  it("removes an archived ticket from active project ticket lists on UPDATE", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    queryClient.setQueryData(queryKeys.tickets.detail(TICKET_ID), {
      id: TICKET_ID,
      projectId: PROJECT_ID,
      title: "Ticket to archive",
      description: null,
      status: "done",
      position: 0,
      codeNumber: 42,
      epicId: null,
      parentId: null,
      sprintId: null,
      priority: null,
      dueDate: null,
      storyPoints: null,
      createdBy: null,
      completedAt: new Date("2026-03-08T10:00:00.000Z"),
      archivedAt: null,
      archivedWeekStart: null,
      createdAt: new Date("2026-03-08T10:00:00.000Z"),
      updatedAt: new Date("2026-03-08T10:00:00.000Z"),
    });

    queryClient.setQueryData(queryKeys.projects.ticketsList(PROJECT_ID), [
      {
        id: TICKET_ID,
        projectId: PROJECT_ID,
        title: "Ticket to archive",
        description: null,
        status: "done",
        position: 0,
        codeNumber: 42,
        epicId: null,
        parentId: null,
        sprintId: null,
        priority: null,
        dueDate: null,
        storyPoints: null,
        createdBy: null,
        completedAt: new Date("2026-03-08T10:00:00.000Z"),
        archivedAt: null,
        archivedWeekStart: null,
        createdAt: new Date("2026-03-08T10:00:00.000Z"),
        updatedAt: new Date("2026-03-08T10:00:00.000Z"),
      },
    ]);

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    const registrationByTable = getRegistrationByTable(registrations);
    const ticketsCallback = registrationByTable.get("tickets")?.callback;

    ticketsCallback?.({
      eventType: "UPDATE",
      old: buildTicketRow({
        status: "done",
        completed_at: "2026-03-08T10:00:00.000Z",
      }),
      new: buildTicketRow({
        status: "done",
        completed_at: "2026-03-08T10:00:00.000Z",
        archived_at: "2026-03-10T09:00:00.000Z",
        archived_week_start: "2026-03-09",
        updated_at: "2026-03-10T09:00:00.000Z",
      }),
    });

    const updatedTicketDetail = queryClient.getQueryData<{
      archivedAt: Date | null;
    }>(queryKeys.tickets.detail(TICKET_ID));
    expect(updatedTicketDetail?.archivedAt).toEqual(
      new Date("2026-03-10T09:00:00.000Z")
    );

    const updatedTicketList = queryClient.getQueryData<
      Array<{ id: string }>
    >(queryKeys.projects.ticketsList(PROJECT_ID));
    expect(updatedTicketList).toEqual([]);

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.projects.ticketsRoot(PROJECT_ID),
      })
    );
  });

  it("targets assignee invalidations and avoids tickets root invalidation", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    const registrationByTable = getRegistrationByTable(registrations);
    const ticketAssigneesCallback =
      registrationByTable.get("ticket_assignees")?.callback;

    ticketAssigneesCallback?.({
      eventType: "INSERT",
      new: { ticket_id: TICKET_ID },
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assignees(TICKET_ID),
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assigneesByProjectId(PROJECT_ID),
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.projects.ticketsRoot(PROJECT_ID),
      })
    );
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.tickets.assigneesRoot(),
      })
    );
  });

  it("invalidates only label-dependent ticket list queries on ticket_labels events", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    const noLabelFilterQueryKey = queryKeys.projects.ticketsList(PROJECT_ID, {
      status: "todo",
    });
    const labelFilterQueryKey = queryKeys.projects.ticketsList(PROJECT_ID, {
      labelIds: ["label-1"],
    });

    queryClient.setQueryData(noLabelFilterQueryKey, []);
    queryClient.setQueryData(labelFilterQueryKey, []);

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    const registrationByTable = getRegistrationByTable(registrations);
    const ticketLabelsCallback =
      registrationByTable.get("ticket_labels")?.callback;

    ticketLabelsCallback?.({
      eventType: "UPDATE",
      new: { ticket_id: TICKET_ID },
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.labels.byTicket(TICKET_ID),
      refetchType: "active",
    });

    const predicateCall = invalidateQueriesSpy.mock.calls.find(([arg]) => {
      const maybeArg = arg as { predicate?: unknown };
      return typeof maybeArg.predicate === "function";
    });

    expect(predicateCall).toBeDefined();
    const predicate = (
      predicateCall?.[0] as {
        predicate: (query: { queryKey: readonly unknown[] }) => boolean;
      }
    ).predicate;
    expect(predicate({ queryKey: labelFilterQueryKey })).toBe(true);
    expect(predicate({ queryKey: noLabelFilterQueryKey })).toBe(false);

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.projects.ticketsRoot(PROJECT_ID),
      })
    );
  });

  it("falls back to project-scoped invalidation when payload has no ticket id", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    const registrationByTable = getRegistrationByTable(registrations);

    registrationByTable.get("ticket_assignees")?.callback({
      eventType: "DELETE",
      old: { id: "assignee-1" },
    });

    registrationByTable.get("ticket_labels")?.callback({
      eventType: "DELETE",
      old: { id: "ticket-label-1" },
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assigneesByProjectId(PROJECT_ID),
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.labels.byProject(PROJECT_ID),
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryKeys.labels.root(),
      })
    );
  });

  it("subscribes only to tickets when boardId is not available", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    renderHook(() => useProjectRealtime(PROJECT_ID), { wrapper });

    expect(registrations).toHaveLength(8);

    const registrationByTable = getRegistrationByTable(registrations);
    expect(registrationByTable.get("columns")).toBeUndefined();

    registrationByTable.get("tickets")?.callback({
      eventType: "INSERT",
      new: buildTicketRow(),
    });

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.projects.ticketsRoot(PROJECT_ID),
      refetchType: "active",
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
