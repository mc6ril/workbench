export const ONBOARDING_STEP_STATUS = Object.freeze({
  COMPLETE: "complete",
  CURRENT: "current",
  PENDING: "pending",
  BLOCKED: "blocked",
} as const);

export type OnboardingStepStatus =
  (typeof ONBOARDING_STEP_STATUS)[keyof typeof ONBOARDING_STEP_STATUS];

export type OnboardingProgressStepStatus = Exclude<
  OnboardingStepStatus,
  typeof ONBOARDING_STEP_STATUS.BLOCKED
>;

export type OnboardingStep = {
  id: string;
  title: string;
  description: string;
  status: OnboardingStepStatus;
  actionLabel?: string;
  actionAriaLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

export type OnboardingTranslationNamespace =
  | "pages.board.onboarding"
  | "pages.epics.onboarding";

export type OnboardingPanelProps = {
  isExpanded: boolean;
  steps: OnboardingStep[];
  onReviewGuide: () => void;
  onHideGuide?: () => void;
  onSkipOnboarding?: () => void;
  isSkipPending?: boolean;
  errorMessage?: string | null;
  translationNamespace?: OnboardingTranslationNamespace;
};
