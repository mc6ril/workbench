import { fireEvent, render, screen } from "@testing-library/react";

import { useBillingVisibility } from "@/domains/billing/presentation/hooks/useBillingVisibility";
import { useSubscription } from "@/domains/billing/presentation/hooks/useSubscription";
import { useTicketGettingStartedStatus } from "@/domains/profile/presentation/hooks/useTicketGettingStartedStatus";
import { useAddUserToProject } from "@/domains/project/presentation/hooks/useAddUserToProject";
import { useCreateProject } from "@/domains/project/presentation/hooks/useCreateProject";
import { useViewer } from "@/domains/viewer/presentation/hooks/useViewer";
import { useLastActivitySubtitle } from "@/domains/workspace/presentation/hooks/useLastActivitySubtitle";
import { useProjectsWithStats } from "@/domains/workspace/presentation/hooks/useProjectsWithStats";
import { useReclaimableProjects } from "@/domains/workspace/presentation/hooks/useReclaimableProjects";
import WorkspacePage from "@/domains/workspace/presentation/pages/workspace";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/domains/profile/presentation/hooks/useTicketGettingStartedStatus", () => ({
  useTicketGettingStartedStatus: jest.fn(),
}));

jest.mock("@/domains/project/presentation/hooks/useAddUserToProject", () => ({
  useAddUserToProject: jest.fn(),
}));

jest.mock("@/domains/project/presentation/hooks/useCreateProject", () => ({
  useCreateProject: jest.fn(),
}));

jest.mock("@/domains/viewer/presentation/hooks/useViewer", () => ({
  useViewer: jest.fn(),
}));

jest.mock(
  "@/domains/workspace/presentation/components/workspace/projectCard/ProjectCardActions",
  () => () => null
);

jest.mock("@/domains/workspace/presentation/hooks/useLastActivitySubtitle", () => ({
  useLastActivitySubtitle: jest.fn(),
}));

jest.mock("@/domains/workspace/presentation/hooks/useProjectsWithStats", () => ({
  useProjectsWithStats: jest.fn(),
}));

jest.mock("@/domains/workspace/presentation/hooks/useReclaimableProjects", () => ({
  useReclaimableProjects: jest.fn(),
}));

jest.mock("@/domains/billing/presentation/hooks/useBillingVisibility", () => ({
  useBillingVisibility: jest.fn(),
}));

jest.mock("@/domains/billing/presentation/hooks/useSubscription", () => ({
  useSubscription: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("WorkspacePage onboarding", () => {
  const markSkipped = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useViewer).mockReturnValue(
      asMockedReturn<ReturnType<typeof useViewer>>({
        data: {
          displayName: "Cyril",
        },
        isLoading: false,
        isPending: false,
      })
    );

    jest.mocked(useProjectsWithStats).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectsWithStats>>({
        data: [],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    jest.mocked(useAddUserToProject).mockReturnValue(
      asMockedReturn<ReturnType<typeof useAddUserToProject>>({
        mutateAsync: jest.fn(),
        isPending: false,
      })
    );

    jest.mocked(useCreateProject).mockReturnValue(
      asMockedReturn<ReturnType<typeof useCreateProject>>({
        mutateAsync: jest.fn(),
        isPending: false,
        isSuccess: false,
        data: undefined,
        error: null,
      })
    );

    jest.mocked(useReclaimableProjects).mockReturnValue(
      asMockedReturn<ReturnType<typeof useReclaimableProjects>>({
        data: [],
      })
    );

    jest.mocked(useBillingVisibility).mockReturnValue(
      asMockedReturn<ReturnType<typeof useBillingVisibility>>({
        data: false,
      })
    );

    jest.mocked(useSubscription).mockReturnValue(
      asMockedReturn<ReturnType<typeof useSubscription>>({
        data: undefined,
        isLoading: false,
      })
    );

    jest.mocked(useLastActivitySubtitle).mockReturnValue(
      (() => "") as ReturnType<typeof useLastActivitySubtitle>
    );
  });

  it("renders the workspace onboarding block when there is no project and getting started is pending", () => {
    jest.mocked(useTicketGettingStartedStatus).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTicketGettingStartedStatus>>({
        status: "pending",
        canAutoOpen: true,
        isLoading: false,
        isPending: false,
        error: null,
        setStatus: jest.fn(),
        setStatusAsync: jest.fn(),
        markSkipped,
        markCompleted: jest.fn(),
      })
    );

    render(<WorkspacePage />);

    expect(screen.getByText("Guide de demarrage")).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Ouvrir le formulaire pour creer mon premier espace",
      })
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", {
        name: "Ne plus ouvrir automatiquement le guide de demarrage",
      })
    );

    expect(markSkipped).toHaveBeenCalledTimes(1);
  });

  it("does not render the onboarding block when automatic opening is disabled", () => {
    jest.mocked(useTicketGettingStartedStatus).mockReturnValue(
      asMockedReturn<ReturnType<typeof useTicketGettingStartedStatus>>({
        status: "skipped",
        canAutoOpen: false,
        isLoading: false,
        isPending: false,
        error: null,
        setStatus: jest.fn(),
        setStatusAsync: jest.fn(),
        markSkipped,
        markCompleted: jest.fn(),
      })
    );

    render(<WorkspacePage />);

    expect(screen.queryByText("Guide de demarrage")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Créer mon premier espace de travail",
      })
    ).toBeInTheDocument();
  });
});
