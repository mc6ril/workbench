import { render } from "@testing-library/react";

import BoardShellAdapter from "@/modules/board/presentation/projectShell/boardShellAdapter";

const registerContributionMock = jest.fn();
const projectToolbarMock = jest.fn((_props: unknown) => null);

jest.mock("@/domains/project/presentation/layouts/projectShell/ProjectShellContributionContext", () => ({
  useRegisterProjectViewContribution: (contribution: unknown) =>
    registerContributionMock(contribution),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/a1111111-1111-4111-8111-111111111111/board",
  useSearchParams: () => new URLSearchParams(""),
}));

jest.mock("@/domains/project/presentation/providers/permissions/ProjectPermissionsProvider", () => ({
  useProjectPermissions: () => ({
    canCreateTicket: false,
    isLoading: true,
  }),
}));

jest.mock("@/domains/project/presentation/hooks/member/useProjectMembers", () => ({
  useProjectMembers: () => ({ data: undefined }),
}));

jest.mock("@/modules/board/presentation/hooks/board/useBoardConfiguration", () => ({
  useBoardConfiguration: () => ({ data: undefined }),
}));

jest.mock("@/modules/board/presentation/hooks/project/useProjectSearchSuggestions", () => ({
  useProjectSearchSuggestions: () => [],
}));

jest.mock("@/modules/board/presentation/hooks/realtime/useProjectRealtime", () => ({
  useProjectRealtime: () => undefined,
}));

jest.mock("@/modules/board/presentation/stores/useFilterStore", () => ({
  useFilterStore: (selector: (state: unknown) => unknown) =>
    selector({
      projectId: "a1111111-1111-4111-8111-111111111111",
      search: "",
      setSearch: jest.fn(),
      initializeProject: jest.fn(),
      filters: {},
      setAssigneeUserId: jest.fn(),
      setUnassignedOnly: jest.fn(),
      clearAssigneeUserId: jest.fn(),
    }),
}));

jest.mock("@/domains/project/presentation/components/projectToolbar/ProjectToolbar", () => ({
  __esModule: true,
  default: (props: unknown) => projectToolbarMock(props),
}));

jest.mock("@/shared/navigation/useAppRouter", () => ({
  useAppRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock("@/shared/i18n", () => ({
  useTranslations: () => (_key: string, _values?: Record<string, unknown>) => "t",
}));

describe("BoardShellAdapter toolbar immediacy", () => {
  beforeEach(() => {
    registerContributionMock.mockReset();
    projectToolbarMock.mockClear();
  });

  it("registers a ProjectToolbar immediately with minimal assignee filters", () => {
    render(
      <BoardShellAdapter projectId="a1111111-1111-4111-8111-111111111111" />
    );

    const contribution = registerContributionMock.mock.calls[0]?.[0] as {
      toolbar?: unknown;
    };
    expect(contribution?.toolbar).toBeTruthy();

    const toolbarElement = contribution.toolbar as {
      props?: {
        showSearch?: boolean;
        isSearchDisabled?: boolean;
        addActionType?: string | null;
        assigneeFilters?: Array<{ type: string }>;
        extraTools?: Array<{ disabled?: boolean }>;
      };
    };

    const toolbarProps = toolbarElement.props ?? {};
    expect(toolbarProps.showSearch).toBe(true);
    expect(toolbarProps.isSearchDisabled).toBe(false);
    expect(toolbarProps.addActionType).toBe("ticket");
    expect(toolbarProps.assigneeFilters?.length).toBe(1);
    expect(toolbarProps.assigneeFilters?.[0]?.type).toBe("unassigned");
    expect(toolbarProps.extraTools?.length).toBe(1);
    expect(toolbarProps.extraTools?.[0]?.disabled).toBeUndefined();
  });
});
