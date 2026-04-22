import { PROJECT_VIEWS } from "@/shared/constants/routes";
import { GuideIcon } from "@/shared/design-system/icons";

import {
  type ProjectToolbarAssigneeFilter,
  type ProjectToolbarProps,
} from "@/domains/project/presentation/components/projectToolbar/ProjectToolbar.types";
import type {
  ProjectViewConfig,
  ProjectViewKey,
} from "@/domains/project/presentation/navigation/projectViews.config";

type TranslateFn = (key: string) => string;

type BuildProjectToolbarPropsArgs = {
  pageTitle: string;
  viewKey: ProjectViewKey;
  viewConfig: ProjectViewConfig;
  tNavbar: TranslateFn;
  tBoardFilters: TranslateFn;
  tBoardOnboarding: TranslateFn;
  overrides?: Partial<ProjectToolbarProps>;
};

export const buildProjectToolbarProps = ({
  pageTitle,
  viewKey,
  viewConfig,
  tNavbar,
  tBoardFilters,
  tBoardOnboarding,
  overrides,
}: BuildProjectToolbarPropsArgs): ProjectToolbarProps => {
  const baseProps: ProjectToolbarProps = {
    pageTitle,
    showSearch: viewConfig.navbar.showSearch,
    addActionType: viewConfig.navbar.addActionType,
  };

  if (viewKey !== PROJECT_VIEWS.BOARD) {
    return {
      ...baseProps,
      ...overrides,
    };
  }

  const immediateAssigneeFilter: ProjectToolbarAssigneeFilter = {
    type: "unassigned",
    label: tBoardFilters("assigneeUnassignedLabel"),
  };

  return {
    ...baseProps,
    hideTitleOnMobile: true,
    isSearchDisabled: true,
    canAddAction: true,
    isPermissionsLoading: true,
    extraTools: [
      {
        key: "review-guide",
        label: tNavbar("reviewGuide"),
        ariaLabel: tBoardOnboarding("reviewCtaAriaLabel"),
        icon: <GuideIcon />,
        disabled: true,
      },
    ],
    assigneeFilters: [immediateAssigneeFilter],
    assigneeFiltersLabel: tBoardFilters("assigneeLabel"),
    areAssigneeFiltersDisabled: true,
    ...overrides,
  };
};
