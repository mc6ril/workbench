import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { useEpicsGettingStartedStatus } from "@/domains/profile/presentation/hooks/useEpicsGettingStartedStatus";
import { useProjectPermissions } from "@/domains/project/presentation/providers/permissions";
import type { EpicWithProgress } from "@/modules/board/core/domain/schema/epic.schema";
import type { Ticket } from "@/modules/board/core/domain/schema/ticket.schema";
import { useEpicQueryParams } from "@/modules/board/presentation/hooks/epic/useEpicQueryParams";
import { useTickets } from "@/modules/board/presentation/hooks/ticket/useTickets";
import EpicsPage from "@/modules/board/presentation/pages/epics";

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockSearchParams = new URLSearchParams();
const mockPathname = "/project-1/epics";

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
  default: ({
    isOpen,
    children,
  }: {
    isOpen: boolean;
    children: React.ReactNode;
  }) => (isOpen ? <div data-testid="modal">{children}</div> : null),
}));

jest.mock(
  "@/modules/board/presentation/components/boardOnboardingPanel/BoardOnboardingPanel",
  () => ({
    __esModule: true,
    default: ({
      steps,
      onHideGuide,
      onReviewGuide,
      onSkipOnboarding,
    }: {
      steps: Array<{
        id: string;
        status: string;
        description: string;
        actionLabel?: string;
        actionAriaLabel?: string;
        onAction?: () => void;
      }>;
      onHideGuide?: () => void;
      onReviewGuide: () => void;
      onSkipOnboarding?: () => void;
    }) => (
      <div data-testid="epics-onboarding-panel">
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

jest.mock(
  "@/modules/board/presentation/components/epic/createEpicForm/CreateEpicForm",
  () => ({
    __esModule: true,
    default: () => <div data-testid="create-epic-form" />,
  })
);

jest.mock(
  "@/modules/board/presentation/components/epic/epicsList/EpicsList",
  () => ({
    __esModule: true,
    default: ({ epics }: { epics: Array<{ id: string }> }) => (
      <div data-testid="epics-list">{epics.length}</div>
    ),
  })
);

jest.mock("@/domains/project/presentation/providers/permissions", () => ({
  useProjectPermissions: jest.fn(),
}));

jest.mock(
  "@/domains/profile/presentation/hooks/useEpicsGettingStartedStatus",
  () => ({
    useEpicsGettingStartedStatus: jest.fn(),
  })
);

jest.mock("@/modules/board/presentation/hooks/epic", () => ({
  useCreateEpic: jest.fn(),
  useEpics: jest.fn(),
}));

jest.mock("@/modules/board/presentation/hooks/epic/useEpicQueryParams", () => ({
  useEpicQueryParams: jest.fn(),
}));

jest.mock("@/modules/board/presentation/hooks/ticket/useTickets", () => ({
  useTickets: jest.fn(),
}));

jest.mock("@/modules/board/presentation/stores/useFilterStore", () => ({
  useFilterStore: (selector: (state: { search: string }) => unknown) =>
    selector({
      search: "",
    }),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;
const buildEpic = (overrides?: Partial<EpicWithProgress>): EpicWithProgress => ({
  id: "11111111-1111-1111-1111-111111111111",
  projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  name: "Goal 1",
  description: null,
  codeNumber: 1,
  startDate: null,
  targetDate: null,
  color: "#112233",
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  progress: 0,
  ...overrides,
});
const buildTicket = (overrides?: Partial<Ticket>): Ticket => ({
  id: "22222222-2222-2222-2222-222222222222",
  projectId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
  title: "Ticket 1",
  description: null,
  status: "todo",
  position: 0,
  codeNumber: 1,
  epicId: null,
  parentId: null,
  sprintId: null,
  priority: null,
  dueDate: null,
  storyPoints: null,
  createdBy: null,
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  ...overrides,
});

describe("EpicsPage onboarding", () => {
  const mockSetStatusAsync = jest.fn();
  const mockCreateEpicMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    mockSetStatusAsync.mockResolvedValue(undefined);
    mockCreateEpicMutateAsync.mockResolvedValue(undefined);

    jest.mocked(useProjectPermissions).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectPermissions>>({
        canCreateEpic: true,
        canCreateTicket: true,
        canEditTicket: true,
        isLoading: false,
      })
    );

    jest
      .mocked(useEpicsGettingStartedStatus)
      .mockReturnValue(
        asMockedReturn<ReturnType<typeof useEpicsGettingStartedStatus>>({
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

    const { useCreateEpic, useEpics } = jest.requireMock(
      "@/modules/board/presentation/hooks/epic"
    );

    jest.mocked(useCreateEpic).mockReturnValue({
      mutateAsync: mockCreateEpicMutateAsync,
      isPending: false,
      error: null,
    });

    jest.mocked(useEpics).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    jest.mocked(useEpicQueryParams).mockReturnValue(
      asMockedReturn<ReturnType<typeof useEpicQueryParams>>({
        epicProgressFilter: "all",
        epicSortField: "updatedAt",
        epicSortDirection: "desc",
      })
    );

    jest.mocked(useTickets).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTickets>>({
        data: [],
      })
    );
  });

  it("auto-opens the goals onboarding while status is pending", () => {
    render(<EpicsPage projectId="project-1" />);

    expect(screen.getByTestId("epics-onboarding-panel")).toBeInTheDocument();
    expect(screen.getByText("create-epic:current")).toBeInTheDocument();
    expect(screen.getByText("link-ticket:blocked")).toBeInTheDocument();
    expect(screen.getByText("track-progress:blocked")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Créez d'abord un premier objectif. Vous pourrez ensuite ouvrir une tâche pour la lier à cet objectif."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Liez d'abord une première tâche à un objectif. Vous pourrez ensuite faire avancer l'objectif et suivre sa progression."
      )
    ).toBeInTheDocument();
  });

  it("skips the onboarding and persists the skipped status", async () => {
    render(<EpicsPage projectId="project-1" />);

    fireEvent.click(screen.getByText("skip-onboarding"));

    await waitFor(() => {
      expect(mockSetStatusAsync).toHaveBeenCalledWith("skipped");
    });

    expect(mockReplace).toHaveBeenCalledWith("/project-1/epics", {
      scroll: false,
    });
  });

  it("opens the board create-ticket flow when a goal exists but no unlinked ticket is available", () => {
    const { useEpics } = jest.requireMock(
      "@/modules/board/presentation/hooks/epic"
    );

    jest.mocked(useEpics).mockReturnValue({
      data: [buildEpic()],
      isLoading: false,
      error: null,
    });

    render(<EpicsPage projectId="project-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ouvrir la creation d'une tache a lier a un objectif",
      })
    );

    expect(mockPush).toHaveBeenCalledWith("/project-1/board?createTicket=1");
  });

  it("opens an existing unlinked ticket to link it to the goal", () => {
    const { useEpics } = jest.requireMock(
      "@/modules/board/presentation/hooks/epic"
    );

    jest.mocked(useEpics).mockReturnValue({
      data: [buildEpic()],
      isLoading: false,
      error: null,
    });

    jest.mocked(useTickets).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTickets>>({
        data: [
          buildTicket({
            id: "33333333-3333-3333-3333-333333333333",
            epicId: null,
          }),
        ],
      })
    );

    render(<EpicsPage projectId="project-1" />);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ouvrir une tache pour la lier a un objectif",
      })
    );

    expect(mockPush).toHaveBeenCalledWith(
      "/project-1/board?ticket=33333333-3333-3333-3333-333333333333"
    );
  });

  it("marks the onboarding as completed when all objective steps are done", async () => {
    const { useEpics } = jest.requireMock(
      "@/modules/board/presentation/hooks/epic"
    );

    jest.mocked(useEpics).mockReturnValue({
      data: [
        buildEpic({
          id: "44444444-4444-4444-4444-444444444444",
          progress: 50,
        }),
      ],
      isLoading: false,
      error: null,
    });

    jest.mocked(useTickets).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTickets>>({
        data: [
          buildTicket({
            id: "55555555-5555-5555-5555-555555555555",
            epicId: "44444444-4444-4444-4444-444444444444",
          }),
        ],
      })
    );

    render(<EpicsPage projectId="project-1" />);

    await waitFor(() => {
      expect(mockSetStatusAsync).toHaveBeenCalledWith("completed");
    });

    expect(mockReplace).toHaveBeenCalledWith("/project-1/epics", {
      scroll: false,
    });
  });

  it("closes a manually reopened onboarding panel", () => {
    mockSearchParams = new URLSearchParams("onboarding=1");

    jest
      .mocked(useEpicsGettingStartedStatus)
      .mockReturnValue(
        asMockedReturn<ReturnType<typeof useEpicsGettingStartedStatus>>({
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

    render(<EpicsPage projectId="project-1" />);

    fireEvent.click(screen.getByText("hide-guide"));

    expect(mockReplace).toHaveBeenCalledWith("/project-1/epics", {
      scroll: false,
    });
  });
});
