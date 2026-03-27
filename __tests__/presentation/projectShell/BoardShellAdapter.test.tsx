import { fireEvent, render, screen } from "@testing-library/react";

import { ProjectShellContributionProvider } from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import { useProjectShellContribution } from "@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext";
import BoardShellAdapter from "@/modules/board/presentation/projectShell/boardShellAdapter";

const pushMock = jest.fn();
const replaceMock = jest.fn();
const prefetchMock = jest.fn();
const prefetchBoardViewMock = jest.fn();
const useProjectRealtimeMock = jest.fn();
let mockPathname = "/project-1/board";
const routerMock = {
  push: pushMock,
  replace: replaceMock,
  prefetch: prefetchMock,
};
const searchParamsMock = new URLSearchParams();

jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => routerMock,
  useSearchParams: () => searchParamsMock,
}));

jest.mock("@/domains/project/presentation/providers/permissions", () => ({
  useProjectPermissions: () => ({
    canCreateTicket: true,
    isLoading: false,
  }),
}));

jest.mock("@/modules/board/presentation/hooks/board/useBoardConfiguration", () => ({
  useBoardConfiguration: () => ({
    data: undefined,
  }),
}));

jest.mock("@/modules/board/presentation/hooks/project/usePrefetchProjectViews", () => ({
  usePrefetchProjectViews: () => ({
    prefetchBoardView: prefetchBoardViewMock,
  }),
}));

jest.mock("@/modules/board/presentation/hooks/project/useProjectShortCode", () => ({
  useProjectShortCode: () => ({
    data: null,
  }),
}));

jest.mock("@/modules/board/presentation/hooks/realtime/useProjectRealtime", () => ({
  useProjectRealtime: (...args: unknown[]) => useProjectRealtimeMock(...args),
}));

jest.mock("@/modules/board/presentation/hooks/ticket/useTickets", () => ({
  useTickets: () => ({
    data: undefined,
  }),
}));

const ContributionProbe = () => {
  const { toolbar } = useProjectShellContribution();

  return <>{toolbar}</>;
};

describe("BoardShellAdapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    searchParamsMock.delete("onboarding");
    mockPathname = "/project-1/board";
  });

  it("mounts without an infinite contribution update loop when queries are still empty", () => {
    expect(() => {
      render(
        <ProjectShellContributionProvider>
          <BoardShellAdapter projectId="project-1" />
        </ProjectShellContributionProvider>
      );
    }).not.toThrow();

    expect(useProjectRealtimeMock).toHaveBeenCalledWith(
      "project-1",
      undefined,
      {
        enabled: true,
      }
    );
  });

  it("opens the onboarding guide from the toolbar button", () => {
    render(
      <ProjectShellContributionProvider>
        <BoardShellAdapter projectId="project-1" />
        <ContributionProbe />
      </ProjectShellContributionProvider>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Revoir le guide d'onboarding du board",
      })
    );

    expect(replaceMock).toHaveBeenCalledWith("/project-1/board?onboarding=1", {
      scroll: false,
    });
  });

  it("closes the onboarding guide from the toolbar button when it is already open", () => {
    searchParamsMock.set("onboarding", "1");

    render(
      <ProjectShellContributionProvider>
        <BoardShellAdapter projectId="project-1" />
        <ContributionProbe />
      </ProjectShellContributionProvider>
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "Masquer le guide d'onboarding du board",
      })
    );

    expect(replaceMock).toHaveBeenCalledWith("/project-1/board", {
      scroll: false,
    });
  });
});
