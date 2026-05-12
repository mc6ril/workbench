import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import {
  buildProjectRoute,
  buildTicketDetailRoute,
} from "@/shared/utils/routes";

import { useProjectMembers } from "@/domains/project/presentation/hooks/member/useProjectMembers";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useBoardDnD } from "@/modules/board/presentation/hooks/board/useBoardDnD";
import { useBoardTickets } from "@/modules/board/presentation/hooks/board/useBoardTickets";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { usePrefetchTicketDetail } from "@/modules/board/presentation/hooks/ticket/usePrefetchTicketDetail";
import { useTicketAssigneesByProjectId } from "@/modules/board/presentation/hooks/ticket/useTicketAssigneesByProjectId";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import BoardPage from "@/modules/board/presentation/pages/board";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const boardViewMock = jest.fn((_props: unknown) => (
  <div data-testid="board-view" />
));
const PROJECT_ID = "project-1";
const mockPathname = buildProjectRoute(PROJECT_ID, PROJECT_VIEWS.BOARD);
let mockSearchParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearchParams,
}));

jest.mock("@dnd-kit/core", () => ({
  DndContext: ({ id, children }: { id?: string; children: ReactNode }) => (
    <div data-testid="dnd-context" data-dnd-id={id}>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

jest.mock("@/shared/design-system/loader", () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

jest.mock(
  "@/modules/board/presentation/components/board/boardView/BoardView",
  () => ({
    __esModule: true,
    default: (props: unknown) => boardViewMock(props),
  })
);

jest.mock(
  "@/modules/board/presentation/components/ticket/ticketCard/TicketCard",
  () => ({
    __esModule: true,
    default: () => <div data-testid="ticket-card" />,
  })
);

jest.mock(
  "@/domains/project/presentation/hooks/member/useProjectMembers",
  () => ({
    useProjectMembers: jest.fn(),
  })
);

jest.mock(
  "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider",
  () => ({
    useProjectPermissions: jest.fn(),
  })
);

jest.mock(
  "@/modules/board/presentation/hooks/board/useBoardConfiguration",
  () => ({
    useBoardConfiguration: jest.fn(),
  })
);

jest.mock("@/modules/board/presentation/hooks/board/useBoardDnD", () => ({
  useBoardDnD: jest.fn(),
}));

jest.mock("@/modules/board/presentation/hooks/board/useBoardTickets", () => ({
  useBoardTickets: jest.fn(),
}));

jest.mock(
  "@/modules/board/presentation/hooks/project/useProjectShortCode",
  () => ({
    useProjectShortCode: jest.fn(),
  })
);

jest.mock(
  "@/modules/board/presentation/hooks/ticket/usePrefetchTicketDetail",
  () => ({
    usePrefetchTicketDetail: jest.fn(),
  })
);

jest.mock(
  "@/modules/board/presentation/hooks/ticket/useTicketAssigneesByProjectId",
  () => ({
    useTicketAssigneesByProjectId: jest.fn(),
  })
);

jest.mock("@/modules/board/presentation/hooks/ticket/useTickets", () => ({
  useTickets: jest.fn(),
}));

jest.mock("@/modules/board/presentation/stores/useFilterStore", () => ({
  useFilterStore: (
    selector: (state: {
      projectId: string | null;
      filters: Record<string, unknown>;
      search: string;
    }) => unknown
  ) =>
    selector({
      projectId: "project-1",
      filters: {},
      search: "",
    }),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("BoardPage", () => {
  const mockPrefetchTicketDetail = jest.fn();
  let mockTicketsData: Array<{
    id: string;
    columnId: string;
    title: string;
    codeNumber: number;
  }> = [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockTicketsData = [];

    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        canComment: true,
        canEditTicket: true,
        canMoveTicket: true,
        canCreateTicket: true,
        isLoading: false,
      })
    );

    jest.mocked(useProjectMembers).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectMembers>>({
        data: [],
      })
    );

    jest.mocked(useBoardConfiguration).mockReturnValue(
      asMockedReturn<ReturnType<typeof useBoardConfiguration>>({
        data: {
          columns: [
            {
              id: "column-todo",
              name: "Todo",
              key: "todo",
              state: "todo",
              position: 0,
              visible: true,
            },
          ],
        },
        isLoading: false,
        error: null,
      })
    );

    jest.mocked(useBoardTickets).mockReturnValue(
      asMockedReturn<ReturnType<typeof useBoardTickets>>({
        filteredTickets: mockTicketsData,
        ticketViewModelById: new Map(),
      })
    );

    jest.mocked(useBoardDnD).mockReturnValue(
      asMockedReturn<ReturnType<typeof useBoardDnD>>({
        sensors: [],
        collisionDetection: jest.fn(),
        activeTicketId: null,
        activeTicket: null,
        boardTicketIds: {},
        boardColumnTickets: new Map([["column-todo", []]]),
        onDragStart: jest.fn(),
        onDragOver: jest.fn(),
        onDragEnd: jest.fn(),
        onDragCancel: jest.fn(),
      })
    );

    jest.mocked(useProjectShortCode).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectShortCode>>({
        data: "WB",
      })
    );

    jest
      .mocked(usePrefetchTicketDetail)
      .mockReturnValue(mockPrefetchTicketDetail);

    jest.mocked(useTicketAssigneesByProjectId).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTicketAssigneesByProjectId>>({
        data: {},
      })
    );

    jest.mocked(useTickets).mockImplementation(() => {
      return asMockedReturn<ReturnType<typeof useTickets>>({
        data: mockTicketsData,
      });
    });
  });

  it("keeps the board area in loading state while client tickets are still fetching", () => {
    jest.mocked(useTickets).mockImplementation(() => {
      return asMockedReturn<ReturnType<typeof useTickets>>({
        data: [],
        isLoading: true,
      });
    });

    render(<BoardPage projectId={PROJECT_ID} />);

    expect(boardViewMock).toHaveBeenCalledWith(
      expect.objectContaining({
        isLoading: true,
      })
    );
  });

  it("redirects legacy ticket query params to the ticket detail page", async () => {
    mockSearchParams = new URLSearchParams("ticket=ticket-1");

    render(<BoardPage projectId={PROJECT_ID} />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(
        buildTicketDetailRoute(PROJECT_ID, "ticket-1"),
        {
          scroll: false,
        }
      );
    });
  });

  it("seeds board queries from server snapshots on the first render", () => {
    const initialBoardConfiguration = {
      board: {
        id: "board-1",
        projectId: PROJECT_ID,
      },
      columns: [
        {
          id: "column-todo",
          name: "Todo",
          key: "todo",
          state: "todo",
          position: 0,
          visible: true,
        },
      ],
    };
    const initialTickets = [
      {
        id: "ticket-1",
        columnId: "column-todo",
        title: "First task",
        codeNumber: 1,
      },
    ];
    render(
      <BoardPage
        projectId={PROJECT_ID}
        initialBoardConfiguration={
          initialBoardConfiguration as Parameters<
            typeof BoardPage
          >[0]["initialBoardConfiguration"]
        }
        initialTickets={
          initialTickets as Parameters<typeof BoardPage>[0]["initialTickets"]
        }
        initialProjectShortCode="WB"
      />
    );

    expect(useBoardConfiguration).toHaveBeenCalledWith(PROJECT_ID, {
      initialData: initialBoardConfiguration,
    });
    expect(useProjectShortCode).toHaveBeenCalledWith(PROJECT_ID, {
      initialData: "WB",
    });
    expect(useTicketAssigneesByProjectId).toHaveBeenCalledWith(PROJECT_ID);
    expect(useTickets).toHaveBeenNthCalledWith(1, PROJECT_ID, {}, "", {
      initialData: initialTickets,
    });
  });

  it("passes a stable id to DndContext to avoid SSR hydration mismatches", () => {
    render(<BoardPage projectId={PROJECT_ID} />);

    expect(screen.getByTestId("dnd-context")).toHaveAttribute(
      "data-dnd-id",
      "a11y-board-dnd-context-project-1"
    );
  });
});
