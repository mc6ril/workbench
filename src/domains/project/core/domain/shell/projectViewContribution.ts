import type { ReactNode } from "react";

export type ProjectViewContribution = {
  toolbar?: ReactNode;
  breadcrumbs?: ReactNode;
  filters?: ReactNode;
  onMount?: () => void;
};

export const EMPTY_PROJECT_VIEW_CONTRIBUTION: ProjectViewContribution =
  Object.freeze({});
