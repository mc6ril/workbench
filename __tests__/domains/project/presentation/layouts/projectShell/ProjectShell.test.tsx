import { QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";

import { createAppQueryClient } from "@/shared/providers/queryClient";

import { ProjectModuleKey } from "@/domains/project/core/domain/projectModule.types";
import ProjectShell from "@/domains/project/presentation/layouts/projectShell/ProjectShell";

jest.mock("next/navigation", () => ({
  usePathname: () => "/project-1/board",
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock(
  "@/domains/project/presentation/components/projectRealtime/ProjectRealtime",
  () => ({
    __esModule: true,
    default: () => null,
  })
);

jest.mock("@/shared/navigation/useAppRouter", () => ({
  useAppRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
}));

jest.mock("@/shared/i18n", () => ({
  useTranslations:
    (namespace: string) => (key: string, _values?: Record<string, unknown>) => {
      const messages: Record<string, Record<string, string>> = {
        "navigation.skipLink": {
          label: "Skip to content",
        },
        "navigation.sidebar": {
          ariaLabel: "Project navigation",
          "items.board": "Board",
        },
        "navigation.navbar": {
          reviewGuide: "Review guide",
          addTicket: "Add task",
          addTicketAriaLabel: "Create a new task",
        },
        "navigation.searchBar": {
          ariaLabel: "Search bar",
          placeholder: "Search",
        },
        "pages.board.filters": {
          assigneeLabel: "Assignee",
          assigneeUnassignedLabel: "Unassigned",
        },
        "pages.board.onboarding": {
          reviewCtaAriaLabel: "Restart onboarding guide",
        },
      };

      return messages[namespace]?.[key] ?? `${namespace}.${key}`;
    },
}));

jest.mock("@/domains/project/presentation/components/dashboardShell", () => ({
  __esModule: true,
  default: ({
    header,
    children,
  }: {
    header?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div>
      <div data-testid="dashboard-header">{header}</div>
      <div data-testid="dashboard-content">{children}</div>
    </div>
  ),
}));

jest.mock(
  "@/domains/project/presentation/components/dashboardShell/dashboardShell.helpers",
  () => ({
    useIsDesktopDashboardViewport: () => true,
  })
);

jest.mock(
  "@/domains/project/presentation/components/sidebarNavigation/SidebarNavigation",
  () => ({
    __esModule: true,
    default: () => <div>Sidebar</div>,
  })
);

jest.mock(
  "@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider",
  () => ({
    ProjectPermissionsProvider: ({
      children,
    }: {
      children: React.ReactNode;
    }) => <>{children}</>,
    useProjectPermissions: () => ({
      canCreateTicket: false,
      canEditProject: false,
      canDeleteProject: false,
      canComment: false,
      canManageMembers: false,
      canMoveTicket: false,
      canCreateEpic: false,
      canEditTicket: false,
      canDeleteTicket: false,
      isViewer: false,
      isMember: false,
      isAdmin: false,
      role: null,
    }),
  })
);

describe("ProjectShell", () => {
  it("renders the immediate board toolbar in the initial shell HTML", () => {
    const queryClient = createAppQueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <ProjectShell
          projectId="project-1"
          shellSnapshot={{
            projectId: "project-1",
            enabledModules: [ProjectModuleKey.RECIPES],
            isRecipesBoardVisible: true,
            role: null,
          }}
        >
          <div>Board content</div>
        </ProjectShell>
      </QueryClientProvider>
    );

    expect(
      screen.getByRole("heading", {
        name: "Board",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("combobox", {
        name: "Search bar",
      })
    ).toHaveAttribute("aria-disabled", "false");
    expect(
      screen.queryByRole("button", {
        name: "Search bar",
      })
    ).not.toBeInTheDocument();
    // Add ticket disabled because canCreateTicket=false (role=null → no permissions)
    expect(
      screen.getByRole("button", {
        name: "Create a new task",
      })
    ).toHaveAttribute("aria-disabled", "true");
    expect(
      screen.getByRole("button", {
        name: "Restart onboarding guide",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("group", {
        name: "Assignee",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Assignee: Unassigned",
      })
    ).toHaveAttribute("aria-disabled", "false");
  });
});
