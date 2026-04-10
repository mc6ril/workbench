import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { PROJECT_VIEWS } from "@/shared/constants/routes";
import {
  buildProjectRoute,
  buildTicketDetailRoute,
} from "@/shared/utils/routes";

import { useTicketGettingStartedStatus } from "@/domains/profile/presentation/hooks/useTicketGettingStartedStatus";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider";
import { useBoardConfiguration } from "@/modules/board/presentation/hooks/board/useBoardConfiguration";
import { useBoardDnD } from "@/modules/board/presentation/hooks/board/useBoardDnD";
import { useBoardTickets } from "@/modules/board/presentation/hooks/board/useBoardTickets";
import { useHasProjectComments } from "@/modules/board/presentation/hooks/comment";
import { useProjectShortCode } from "@/modules/board/presentation/hooks/project/useProjectShortCode";
import { useCreateTicket } from "@/modules/board/presentation/hooks/ticket/useCreateTicket";
import { usePrefetchTicketDetail } from "@/modules/board/presentation/hooks/ticket/usePrefetchTicketDetail";
import { useTicketAssigneesByProjectId } from "@/modules/board/presentation/hooks/ticket/useTicketAssigneesByProjectId";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import BoardPage from "@/modules/board/presentation/pages/board";

const mockPush = jest.fn();
const mockReplace = jest.fn();
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

jest.mock("@/shared/design-system/loader", () => ({
  __esModule: true,
  default: () => <div>loading</div>,
}));

jest.mock("@/shared/design-system/modal", () => ({
  __esModule: true,
  default: ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
}));

jest.mock(
  "@/modules/board/presentation/components/boardOnboardingPanel/BoardOnboardingPanel",
  () => ({
    __esModule: true,
    default: ({
      isExpanded,
      onReviewGuide,
      onHideGuide,
      onSkipOnboarding,
      steps,
    }: {
      isExpanded: boolean;
      onReviewGuide: () => void;
      onHideGuide?: () => void;
      onSkipOnboarding?: () => void;
      steps: Array<{
        id: string;
        status: string;
        description: string;
        actionLabel?: string;
        actionAriaLabel?: string;
        onAction?: () => void;
      }>;
    }) => (
      <div
        data-testid="board-onboarding-panel"
        data-expanded={String(isExpanded)}
      >
        <button onClick={onReviewGuide}>review-guide</button>
        {onHideGuide ? <button onClick={onHideGuide}>hide-guide</button> : null}
        {onSkipOnboarding ? (
          <button onClick={onSkipOnboarding}>skip-onboarding</button>
        ) : null}
        {steps.map((step) => (
          <div key={step.id}>
            <span>{`${step.id}:${step.status}`}</span>
            <span>{step.description}</span>
            {step.onAction ? (
              <button onClick={step.onAction} aria-label={step.actionAriaLabel}>
                {step.actionLabel ?? step.id}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    ),
  })
);

jest.mock("@/modules/board/presentation/components/board/boardView/BoardView", () => ({
  __esModule: true,
  default: () => <div data-testid="board-view" />,
}));

jest.mock(
  "@/modules/board/presentation/components/ticket/ticketDetailView/TicketDetailView",
  () => ({
    __esModule: true,
    default: () => <div data-testid="ticket-detail-view" />,
  })
);

jest.mock(
  "@/modules/board/presentation/components/ticket/createTicketForm/CreateTicketForm",
  () => ({
    __esModule: true,
    default: () => <div data-testid="create-ticket-form" />,
  })
);

jest.mock("@/modules/board/presentation/components/ticket/ticketCard/TicketCard", () => ({
  __esModule: true,
  default: () => <div data-testid="ticket-card" />,
}));

jest.mock("@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider", () => ({
  useProjectPermissions: jest.fn(),
}));

jest.mock("@/domains/profile/presentation/hooks/useTicketGettingStartedStatus", () => ({
  useTicketGettingStartedStatus: jest.fn(),
}));

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

jest.mock("@/modules/board/presentation/hooks/comment", () => ({
  useHasProjectComments: jest.fn(),
}));

jest.mock(
  "@/modules/board/presentation/hooks/project/useProjectShortCode",
  () => ({
    useProjectShortCode: jest.fn(),
  })
);

jest.mock("@/modules/board/presentation/hooks/ticket/useCreateTicket", () => ({
  useCreateTicket: jest.fn(),
}));

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

describe("BoardPage onboarding", () => {
  const mockSetStatusAsync = jest.fn();
  const mockCreateTicketMutateAsync = jest.fn();
  const mockPrefetchTicketDetail = jest.fn();
  let mockTicketsData: Array<{
    id: string;
    columnId: string;
    title: string;
    codeNumber: number;
  }> =
    [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockTicketsData = [];
    mockSetStatusAsync.mockResolvedValue(undefined);

    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        canComment: true,
        canEditTicket: true,
        canMoveTicket: true,
        canCreateTicket: true,
        isLoading: false,
      })
    );

    jest.mocked(useTicketGettingStartedStatus).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTicketGettingStartedStatus>>({
        status: "pending",
        canAutoOpen: true,
        isLoading: false,
        isPending: false,
        error: null,
        setStatus: jest.fn(),
        setStatusAsync: mockSetStatusAsync,
        markSkipped: jest.fn(),
        markCompleted: jest.fn(),
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

    jest.mocked(useHasProjectComments).mockReturnValue(
      asMockedReturn<ReturnType<typeof useHasProjectComments>>({
        data: false,
      })
    );

    jest.mocked(useProjectShortCode).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectShortCode>>({
        data: "WB",
      })
    );

    jest.mocked(useCreateTicket).mockReturnValue(
      asMockedReturn<ReturnType<typeof useCreateTicket>>({
        mutateAsync: mockCreateTicketMutateAsync,
        isPending: false,
        error: null,
      })
    );

    jest.mocked(usePrefetchTicketDetail).mockReturnValue(
      mockPrefetchTicketDetail
    );

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

  it("auto-opens the onboarding when getting started is still pending", () => {
    render(<BoardPage projectId={PROJECT_ID} />);

    expect(screen.getByTestId("board-onboarding-panel")).toHaveAttribute(
      "data-expanded",
      "true"
    );
    expect(screen.getByText("skip-onboarding")).toBeInTheDocument();
    expect(screen.getByText("assign-ticket:blocked")).toBeInTheDocument();
    expect(screen.getByText("comment-ticket:blocked")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Créez d'abord un premier ticket. Vous pourrez ensuite l'ouvrir et l'assigner a une personne."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Créez d'abord un premier ticket. Vous pourrez ensuite l'ouvrir et y ajouter un commentaire."
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: "Ouvrir un ticket pour l'assigner",
      })
    ).not.toBeInTheDocument();
  });

  it("persists skipped status and closes the guide", async () => {
    mockSearchParams = new URLSearchParams("onboarding=1");

    render(<BoardPage projectId="project-1" />);

    fireEvent.click(screen.getByText("skip-onboarding"));

    await waitFor(() => {
      expect(mockSetStatusAsync).toHaveBeenCalledWith("skipped");
    });
    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith(mockPathname, {
        scroll: false,
      });
    });
  });

  it("opens the ticket detail from the onboarding step action", () => {
    mockTicketsData = [
      {
        id: "ticket-1",
        columnId: "column-todo",
        title: "First task",
        codeNumber: 1,
      },
    ];

    render(<BoardPage projectId="project-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ouvrir un ticket pour l'assigner",
      })
    );

    expect(mockPush).toHaveBeenCalledWith(
      buildTicketDetailRoute(PROJECT_ID, "ticket-1")
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

  it("does not render the onboarding panel when auto-open is disabled", () => {
    jest.mocked(useTicketGettingStartedStatus).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTicketGettingStartedStatus>>({
        status: "completed",
        canAutoOpen: false,
        isLoading: false,
        isPending: false,
        error: null,
        setStatus: jest.fn(),
        setStatusAsync: mockSetStatusAsync,
        markSkipped: jest.fn(),
        markCompleted: jest.fn(),
      })
    );

    render(<BoardPage projectId="project-1" />);

    expect(
      screen.queryByTestId("board-onboarding-panel")
    ).not.toBeInTheDocument();
  });

  it("shows the manually reopened guide even after completion and allows hiding it", () => {
    mockSearchParams = new URLSearchParams("onboarding=1");
    jest.mocked(useTicketGettingStartedStatus).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTicketGettingStartedStatus>>({
        status: "completed",
        canAutoOpen: false,
        isLoading: false,
        isPending: false,
        error: null,
        setStatus: jest.fn(),
        setStatusAsync: mockSetStatusAsync,
        markSkipped: jest.fn(),
        markCompleted: jest.fn(),
      })
    );

    render(<BoardPage projectId="project-1" />);

    expect(screen.getByTestId("board-onboarding-panel")).toHaveAttribute(
      "data-expanded",
      "true"
    );
    expect(screen.queryByText("skip-onboarding")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("hide-guide"));

    expect(mockReplace).toHaveBeenCalledWith(mockPathname, {
      scroll: false,
    });
  });

  it("persists completed status when the onboarding steps are done", async () => {
    mockTicketsData = [
      {
        id: "ticket-1",
        columnId: "column-todo",
        title: "First task",
        codeNumber: 1,
      },
    ];

    jest.mocked(useTicketAssigneesByProjectId).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTicketAssigneesByProjectId>>({
        data: {
          "ticket-1": [{ userId: "user-1" }],
        },
      })
    );
    jest.mocked(useHasProjectComments).mockReturnValue(
      asMockedReturn<ReturnType<typeof useHasProjectComments>>({
        data: true,
      })
    );

    render(<BoardPage projectId="project-1" />);

    await waitFor(() => {
      expect(mockSetStatusAsync).toHaveBeenCalledWith("completed");
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
    const initialTicketAssigneesByProjectId = {
      "ticket-1": [
        {
          userId: "user-1",
          displayName: "Ada",
          avatarUrl: null,
          assignedAt: new Date("2026-04-09T08:00:00.000Z"),
        },
      ],
    };

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
        initialTicketAssigneesByProjectId={
          initialTicketAssigneesByProjectId as Parameters<
            typeof BoardPage
          >[0]["initialTicketAssigneesByProjectId"]
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
    expect(useTicketAssigneesByProjectId).toHaveBeenCalledWith(PROJECT_ID, {
      initialData: initialTicketAssigneesByProjectId,
    });
    expect(useTickets).toHaveBeenNthCalledWith(
      1,
      PROJECT_ID,
      {},
      "",
      {
        initialData: initialTickets,
      }
    );
  });
});
