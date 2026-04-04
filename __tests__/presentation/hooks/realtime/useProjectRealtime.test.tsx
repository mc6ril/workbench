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
const OTHER_PROJECT_ID = "project-2";
const BOARD_ID = "board-1";
const TICKET_ID = "ticket-1";
const OTHER_TICKET_ID = "ticket-2";

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
    column_id: "column-todo",
    position: 1,
    code_number: 42,
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

const buildTicketEntity = (
  overrides: Partial<Record<string, unknown>> = {}
): Record<string, unknown> => {
  return {
    id: TICKET_ID,
    projectId: PROJECT_ID,
    title: "Refactor realtime invalidation",
    description: null,
    columnId: "column-todo",
    position: 1,
    codeNumber: 42,
    priority: null,
    dueDate: null,
    storyPoints: null,
    createdBy: null,
    completedAt: null,
    archivedAt: null,
    archivedWeekStart: null,
    createdAt: new Date("2026-03-08T10:00:00.000Z"),
    updatedAt: new Date("2026-03-08T10:00:00.000Z"),
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
      columnId: "column-todo",
      position: 1,
      codeNumber: 42,
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
        columnId: "column-todo",
        position: 1,
        codeNumber: 42,
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
      columnId: "column-done",
      position: 0,
      codeNumber: 42,
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
        columnId: "column-done",
        position: 0,
        codeNumber: 42,
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
        column_id: "column-done",
        completed_at: "2026-03-08T10:00:00.000Z",
      }),
      new: buildTicketRow({
        column_id: "column-done",
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

    queryClient.setQueryData(queryKeys.projects.ticketsList(PROJECT_ID), [
      buildTicketEntity(),
    ]);
    queryClient.setQueryData(queryKeys.tickets.assignees(TICKET_ID), []);
    queryClient.setQueryData(queryKeys.tickets.assigneesByProjectId(PROJECT_ID), {});

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

  it("patches assignee caches for current project tickets when payload is complete", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    queryClient.setQueryData(queryKeys.projects.ticketsList(PROJECT_ID), [
      buildTicketEntity(),
    ]);
    queryClient.setQueryData(queryKeys.tickets.assignees(TICKET_ID), []);
    queryClient.setQueryData(queryKeys.tickets.assigneesByProjectId(PROJECT_ID), {});

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    const registrationByTable = getRegistrationByTable(registrations);
    const ticketAssigneesCallback =
      registrationByTable.get("ticket_assignees")?.callback;

    ticketAssigneesCallback?.({
      eventType: "INSERT",
      new: {
        ticket_id: TICKET_ID,
        user_id: "user-1",
        assigned_at: "2026-03-08T12:00:00.000Z",
      },
    });

    expect(
      queryClient.getQueryData(queryKeys.tickets.assignees(TICKET_ID))
    ).toEqual([
      {
        userId: "user-1",
        displayName: null,
        avatarUrl: null,
        assignedAt: new Date("2026-03-08T12:00:00.000Z"),
      },
    ]);

    expect(
      queryClient.getQueryData(queryKeys.tickets.assigneesByProjectId(PROJECT_ID))
    ).toEqual({
      [TICKET_ID]: [
        {
          userId: "user-1",
          displayName: null,
          avatarUrl: null,
          assignedAt: new Date("2026-03-08T12:00:00.000Z"),
        },
      ],
    });

    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assignees(TICKET_ID),
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assigneesByProjectId(PROJECT_ID),
      refetchType: "active",
    });
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

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assigneesByProjectId(PROJECT_ID),
      refetchType: "active",
    });
  });

  it("ignores ticket assignee events for tickets outside the current project", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    queryClient.setQueryData(queryKeys.tickets.detail(OTHER_TICKET_ID), {
      ...buildTicketEntity({
        id: OTHER_TICKET_ID,
        projectId: OTHER_PROJECT_ID,
      }),
    });
    queryClient.setQueryData(queryKeys.tickets.assigneesByProjectId(PROJECT_ID), {});

    renderHook(() => useProjectRealtime(PROJECT_ID, BOARD_ID), { wrapper });

    const registrationByTable = getRegistrationByTable(registrations);
    registrationByTable.get("ticket_assignees")?.callback({
      eventType: "INSERT",
      new: {
        ticket_id: OTHER_TICKET_ID,
        user_id: "user-1",
        assigned_at: "2026-03-08T12:00:00.000Z",
      },
    });

    expect(
      queryClient.getQueryData(queryKeys.tickets.assigneesByProjectId(PROJECT_ID))
    ).toEqual({});
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assigneesByProjectId(PROJECT_ID),
      refetchType: "active",
    });
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: queryKeys.tickets.assignees(OTHER_TICKET_ID),
      refetchType: "active",
    });
  });

  it("subscribes only to tickets when boardId is not available", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = jest.spyOn(queryClient, "invalidateQueries");
    const wrapper = createWrapper(queryClient);
    const { registrations } = createRealtimeMocks();

    renderHook(() => useProjectRealtime(PROJECT_ID), { wrapper });

    expect(registrations).toHaveLength(4);

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
