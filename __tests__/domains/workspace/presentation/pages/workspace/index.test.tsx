import { render, screen } from "@testing-library/react";

import { useAuthIdentity } from "@/domains/auth/presentation/hooks/identity/useAuthIdentity";
import { useBillingVisibility } from "@/domains/billing/presentation/hooks/useBillingVisibility";
import { ProjectRole } from "@/domains/project/core/domain/project.types";
import { useAddUserToProject } from "@/domains/project/presentation/hooks/useAddUserToProject";
import { useCreateProject } from "@/domains/project/presentation/hooks/useCreateProject";
import { useLastActivitySubtitle } from "@/domains/workspace/presentation/hooks/useLastActivitySubtitle";
import { useProjectsWithStats } from "@/domains/workspace/presentation/hooks/useProjectsWithStats";
import { useReclaimableProjects } from "@/domains/workspace/presentation/hooks/useReclaimableProjects";
import WorkspacePageContainer from "@/domains/workspace/presentation/pages/workspace/WorkspacePageContainer";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

jest.mock("@/domains/project/presentation/hooks/useAddUserToProject", () => ({
  useAddUserToProject: jest.fn(),
}));

jest.mock("@/domains/project/presentation/hooks/useCreateProject", () => ({
  useCreateProject: jest.fn(),
}));

jest.mock("@/domains/auth/presentation/hooks/identity/useAuthIdentity", () => ({
  useAuthIdentity: jest.fn(),
}));

jest.mock(
  "@/domains/workspace/presentation/hooks/useLastActivitySubtitle",
  () => ({
    useLastActivitySubtitle: jest.fn(),
  })
);

jest.mock(
  "@/domains/workspace/presentation/hooks/useProjectsWithStats",
  () => ({
    useProjectsWithStats: jest.fn(),
  })
);

jest.mock(
  "@/domains/workspace/presentation/hooks/useReclaimableProjects",
  () => ({
    useReclaimableProjects: jest.fn(),
  })
);

jest.mock("@/domains/billing/presentation/hooks/useBillingVisibility", () => ({
  useBillingVisibility: jest.fn(),
}));

const asMockedReturn = <T,>(value: unknown): T => value as T;

describe("WorkspacePage", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    jest.mocked(useAuthIdentity).mockReturnValue(
      asMockedReturn<ReturnType<typeof useAuthIdentity>>({
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

    jest
      .mocked(useLastActivitySubtitle)
      .mockReturnValue(
        (() => "") as ReturnType<typeof useLastActivitySubtitle>
      );
  });

  it("does not render a project actions menu on workspace cards", () => {
    jest.mocked(useProjectsWithStats).mockReturnValue(
      asMockedReturn<ReturnType<typeof useProjectsWithStats>>({
        data: [
          {
            id: "project-1",
            name: "Maison",
            shortCode: "MA",
            createdAt: new Date("2024-01-01T00:00:00Z"),
            updatedAt: new Date("2024-01-02T00:00:00Z"),
            role: ProjectRole.ADMIN,
            memberCount: 2,
            ticketCount: 4,
            inProgressCount: 2,
            completedCount: 2,
          },
        ],
        isLoading: false,
        isFetching: false,
        error: null,
        refetch: jest.fn(),
      })
    );

    render(<WorkspacePageContainer />);

    expect(screen.getByText("Maison")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", {
        name: /menu d'actions|ouvrir le menu/i,
      })
    ).not.toBeInTheDocument();
  });
});
