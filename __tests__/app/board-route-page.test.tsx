import { render, screen } from "@testing-library/react";

import { createSupabaseServerClient } from "@/shared/infrastructure/supabase/client-server";
import { createAppQueryClient } from "@/shared/providers/queryClient";

import BoardRoutePage from "@/app/(protected)/[projectId]/board/page";
import type { Project } from "@/domains/project/core/domain/project.types";
import { getProjectForRoute } from "@/domains/project/infrastructure/server/getProjectForRoute";
import { getBoardConfiguration } from "@/modules/board/core/usecases/board/getBoardConfiguration";
import { getTicketAssigneesByProjectId } from "@/modules/board/core/usecases/ticket/getTicketAssigneesByProjectId";
import { listTickets } from "@/modules/board/core/usecases/ticket/listTickets";
import {
  createBoardRepository,
  createTicketRepository,
} from "@/modules/board/infrastructure/supabase/repositories";
import { queryKeys } from "@/modules/board/presentation/hooks/queryKeys";

const dehydrateMock = jest.fn((_queryClient?: unknown) => ({
  board: true,
}));
const boardPageContentMock = jest.fn((_props: unknown) => (
  <div>Board content</div>
));

jest.mock("@tanstack/react-query", () => ({
  HydrationBoundary: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  dehydrate: (queryClient: unknown) => dehydrateMock(queryClient),
}));

jest.mock("@/shared/design-system/loader", () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

jest.mock("@/shared/providers/queryClient", () => ({
  createAppQueryClient: jest.fn(),
}));

jest.mock("@/shared/infrastructure/supabase/client-server", () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock("@/modules/board/infrastructure/supabase/repositories", () => ({
  createBoardRepository: jest.fn(),
  createTicketRepository: jest.fn(),
}));

jest.mock("@/modules/board/core/usecases/board/getBoardConfiguration", () => ({
  getBoardConfiguration: jest.fn(),
}));

jest.mock("@/modules/board/core/usecases/ticket/listTickets", () => ({
  listTickets: jest.fn(),
}));

jest.mock(
  "@/modules/board/core/usecases/ticket/getTicketAssigneesByProjectId",
  () => ({
    getTicketAssigneesByProjectId: jest.fn(),
  })
);

jest.mock("@/domains/project/infrastructure/server/getProjectForRoute", () => ({
  getProjectForRoute: jest.fn(),
}));

jest.mock("@/modules/board/presentation/pages/board", () => ({
  __esModule: true,
  default: (props: unknown) => boardPageContentMock(props),
}));

describe("BoardRoutePage hydration", () => {
  const PROJECT_ID = "a1111111-1111-4111-8111-111111111111";
  const mockQueryClient = {
    fetchQuery: jest.fn(),
    setQueryData: jest.fn(),
  };
  const mockSupabaseClient = { tag: "supabase" };
  const mockBoardRepository = { tag: "boardRepository" };
  const mockTicketRepository = { tag: "ticketRepository" };
  const boardConfiguration = {
    board: {
      id: "board-1",
      projectId: PROJECT_ID,
      createdAt: new Date("2026-04-09T08:00:00.000Z"),
      updatedAt: new Date("2026-04-09T08:00:00.000Z"),
    },
    columns: [
      {
        id: "column-todo",
        boardId: "board-1",
        name: "Todo",
        key: "todo",
        state: "todo" as const,
        position: 0,
        visible: true,
        createdAt: new Date("2026-04-09T08:00:00.000Z"),
        updatedAt: new Date("2026-04-09T08:00:00.000Z"),
      },
    ],
  };
  const tickets = [
    {
      id: "ticket-1",
      projectId: PROJECT_ID,
      title: "First task",
      description: null,
      columnId: "column-todo",
      position: 0,
      codeNumber: 1,
      priority: null,
      dueDate: null,
      storyPoints: null,
      createdBy: "user-1",
      completedAt: null,
      archivedAt: null,
      archivedWeekStart: null,
      createdAt: new Date("2026-04-09T08:00:00.000Z"),
      updatedAt: new Date("2026-04-09T08:00:00.000Z"),
    },
  ];
  const ticketAssigneesByProjectId = {
    "ticket-1": [
      {
        userId: "user-2",
        displayName: "Ada",
        avatarUrl: null,
        assignedAt: new Date("2026-04-09T08:00:00.000Z"),
      },
    ],
  };
  const projectShortCode = "WB";
  const projectFromRoute: Project = {
    id: PROJECT_ID,
    name: "Test project",
    shortCode: projectShortCode,
    boardEmoji: "📋",
    enabledModules: [],
    createdAt: new Date("2026-04-09T08:00:00.000Z"),
    updatedAt: new Date("2026-04-09T08:00:00.000Z"),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    dehydrateMock.mockReturnValue({ board: true });

    mockQueryClient.fetchQuery.mockReset();
    mockQueryClient.fetchQuery.mockImplementation(async ({ queryFn }) => {
      return queryFn();
    });

    jest.mocked(createAppQueryClient).mockReturnValue(mockQueryClient as never);
    jest
      .mocked(createSupabaseServerClient)
      .mockResolvedValue(mockSupabaseClient as never);
    jest
      .mocked(createBoardRepository)
      .mockReturnValue(mockBoardRepository as never);
    jest
      .mocked(createTicketRepository)
      .mockReturnValue(mockTicketRepository as never);
    jest.mocked(getBoardConfiguration).mockResolvedValue(boardConfiguration);
    jest.mocked(listTickets).mockResolvedValue(tickets);
    jest
      .mocked(getTicketAssigneesByProjectId)
      .mockResolvedValue(ticketAssigneesByProjectId);
    jest.mocked(getProjectForRoute).mockResolvedValue(projectFromRoute);
  });

  it("hydrates the board page and forwards server snapshots to the client page", async () => {
    const result = await BoardRoutePage({
      params: Promise.resolve({ projectId: PROJECT_ID }),
    });

    render(result);

    expect(screen.getByText("Board content")).toBeInTheDocument();
    expect(mockQueryClient.fetchQuery).toHaveBeenNthCalledWith(1, {
      queryKey: queryKeys.projects.boardConfiguration(PROJECT_ID),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.fetchQuery).toHaveBeenNthCalledWith(2, {
      queryKey: queryKeys.projects.ticketsList(
        PROJECT_ID,
        undefined,
        undefined
      ),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.fetchQuery).toHaveBeenNthCalledWith(3, {
      queryKey: queryKeys.tickets.assigneesByProjectId(PROJECT_ID),
      queryFn: expect.any(Function),
    });
    expect(mockQueryClient.fetchQuery).toHaveBeenCalledTimes(3);
    expect(getProjectForRoute).toHaveBeenCalledWith(PROJECT_ID);
    expect(getBoardConfiguration).toHaveBeenCalledWith(
      mockBoardRepository,
      PROJECT_ID
    );
    expect(listTickets).toHaveBeenCalledWith(mockTicketRepository, PROJECT_ID);
    expect(getTicketAssigneesByProjectId).toHaveBeenCalledWith(
      mockTicketRepository,
      PROJECT_ID
    );
    expect(boardPageContentMock).toHaveBeenCalledWith({
      projectId: PROJECT_ID,
      initialBoardConfiguration: boardConfiguration,
      initialTickets: tickets,
      initialTicketAssigneesByProjectId: ticketAssigneesByProjectId,
      initialProjectShortCode: projectShortCode,
    });
    expect(dehydrateMock).toHaveBeenCalledWith(mockQueryClient);
  });
});
